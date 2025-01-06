; Slideshow for classic and color

; This ROM expects image data to be injected externally in the following form:
; The external tool needs to
; 1. set the cart type in the header to ROM only, MBC1 or MBC5 (others might work, too) along with the cart size (TODO The webinterface currently only generates MBC5 ROMs)
; 2. set the DMG only or CGB/DMG hybrid mode in the header (CGB only would be pointless at this time, but should work, too) (TODO The webinterface currently only supports hybrid)
; 3. Write a list of up to 256 image parameters with 4 bytes each at IMAGEDATADMG (see below).
;    These 4 bytes per image consist of the following: [BANK][ADDR MSB][ADDR LSB][SLEEP]
;    A 4 byte block like this indicates that this DMG image can be found in memory bank [BANK] at the 16bit address [ADDR] and it should be shown for [SLEEP] seconds.
;    Setting [SLEEP] to zero disables automatically going to the next image (moving with buttons still works)
;    If less then 256 images are used, the remaining entries should be set to 0x00.
; 4. Write DMG tile data corresponding to the entries in 3. This consists of 360 tiles in the native DMG format and they will be copied as they are to VRAM and displayed on screen.
;    Note that this tool uses a color palette from 00 = black over 01, and 10 to 11 = white.
; 5. (If color support is enabled) write another image list to IMAGEDATACGB (see below).
;    The format is the same, but because of the size of color images, you usually keep address to zero to fit one image into a single bank.
;    Note, that the color format has been chosen such that there is room for a single DMG image in the same bank.
;    So, when in hybrid mode it makes sense to fill each bank with a color image followed by the corresponding DMG image (or vice versa).
;    Note, that since BANK is only one byte and BANK0 is taken, in practice a maximum of 254 images can be stored if every BANK up to 0xff is used.
;    The remainder of the 4*256B block should be filled with 0x00.
; 6. (If color support is enabled) write image data corresponding to the entries in 5. This always has to start at the beginning of a bank (i.e. 0x4000) and consists of three blocks:
;    a) 5760B of tile data for 360 tiles. Will be copied to VRAM just like in the DMG case.
;    b) 180B of palette mapping. These correspond to palette indices (0-7) for each of the 360 tiles, but are packet into two indices per byte.
;                                So, 0x47 as first byte means that the first tile uses palette 4 and the second tile uses palette 7.
;    c) 4640B of palette data. The first 64B correspond to palettes 0-7 being loaded during VBLANK for the first line.
;                              After that, 32B will be loaded for each following line, alternately replacing palettes 4-7 and 0-3.
;                              Even lines get new palettes 4-7 and off lines get new palettes 0-3.
;    Note that the combination of fixed palettes per tile and only a specific subset of palettes being replaced on each line makes this a bit tricky to optimize. 
; 7. fix the complement check and checksum in the header (TODO The webinterface currently does not modify the header, so rgbfix's complement check remains valid, checksum is not corrected but rather pointless anyway)


DEF IMAGEDATADMG     EQU $1000                  ;Image list for DMG mode
DEF IMAGEDATADMGEND  EQU IMAGEDATADMG + 4*256
DEF IMAGEDATACGB     EQU IMAGEDATADMGEND        ;Image list for CGB mode
DEF IMAGEDATACGBEND  EQU IMAGEDATACGB + 4*256
DEF CGBMODE          EQU $FF80                  ;CGB mode if non-zero
DEF IMAGEINDEX       EQU $FF81                  ;Index of current image
DEF IMAGESLEEP       EQU $FF82                  ;Sleep time in second of current image
DEF FRAMECOUNTER     EQU $FF83                  ;Frame counter
DEF SCOUNTER         EQU $FF84                  ;Seconds counter (increments every 60 frames)
DEF DEBOUNCE         EQU $FF85                  ;Debounce (set to non-zero on keypress and new keypress only allowed when it has been reset to zero)
DEF PALETTEDATA      EQU $FF86                  ;16bit address for the palette data of the current image
DEF STACKPOINTER     EQU $FF88                  ;Holds stackpointer when sp is used in other ways

SECTION "LCDC_STAT_IRQ", ROM0[$0048]
    RETI

SECTION "start", ROM0[$0100]
    nop
    jp BEGIN

 DB $CE,$ED,$66,$66,$CC,$0D,$00,$0B,$03,$73,$00,$83,$00,$0C,$00,$0D
 DB $00,$08,$11,$1F,$88,$89,$00,$0E,$DC,$CC,$6E,$E6,$DD,$DD,$D9,$99
 DB $BB,$BB,$67,$63,$6E,$0E,$EC,$CC,$DD,$DC,$99,$9F,$BB,$B9,$33,$3E

 DB "SLIDESHOW",0,0,0,0,0,0   ; Cart name - 15bytes
 DB $80                       ; $143 - Card supports both, DMG and CGB double speed mode
 DB 0,0                       ; $144 - Licensee code
 DB 0                         ; $146 - SGB Support indicator
 DB $19                       ; $147 - Cart type
 DB $08                       ; $148 - ROM Size
 DB 0                         ; $149 - RAM Size
 DB 1                         ; $14a - Destination code
 DB $33                       ; $14b - Old licensee code
 DB 0                         ; $14c - Mask ROM version
 DB 0                         ; $14d - Complement check
 DW 0                         ; $14e - Checksum

MACRO WaitForMode
    ld c, $41 ;We need to check ff41 here
    .waitMode\@:
        ldh	a, [c]
        and	a, %00000011
        cp \1
        jr nz, .waitMode\@

	ENDM

LOADTILES:
    ;B should contain the number of tiles
    ;DE should point to source

.LOADTILESLOOP:
    ; Load 16 bytes = 1 tile
    REPT 16        
        ld a, [de]
        ld [hli], a
        inc de
    ENDR
    dec B
    jr nz, .LOADTILESLOOP

    ret

LOADIMAGE:
    ;DE should contain source address

    di ;Disable interrupts while loading

    ; Turn off LCD while loading
    ld a, %00010001    ;LCD off, BG Tile Data 0x8000, BG ON
    ld [$ff40], a

    ld hl, $8000 ;Start of tile data target in VRAM

    ld b, 180
    call LOADTILES
    ld b, 180
    call LOADTILES

    ;Load tile attribute data in case of CGB mode and store palette data starting address in HRAM
    ld a, [CGBMODE]
    and a
    jp z, .SKIPCGBDATA

    ;Load palette indices into BG Map attribute data
    ld [$FF4F], a ;Switch to VRAM bank 1
    ld hl, $9800 ;Address of tile attribute data
    ld b, 18 ;Number of tile lines
    .TILEATTR_LINE_LOOP:
        REPT 10 ; Each byte holds the palette index of two tiles, so ten repetitions equal 20 tile columns
            ld a, [de]  ;First tile
            swap a
            and $0f
            ld [hli], a
            ld a, [de]  ;Second tile
            and $0f
            ld [hli], a
            inc de
        ENDR
        ld a, b     ;In order to use 16bit addition to increment hl, I need to move the counter data in b out of the way. There has to be a more elegant way, but I am not seeing it and at this point the minor speed impact isn't noticable.
        ld bc, 12
        add hl, bc
        ld b, a
        dec b
        jr nz, .TILEATTR_LINE_LOOP

    ld a, 0
    ld [$FF4F], a ;Switch back to VRAM bank 0

    ;Store palette data address
    ld hl, PALETTEDATA
    ld [hl], d
    inc hl
    ld [hl], e
    jr .SKIPIRQ

    .SKIPCGBDATA:
    ei  ;DMG mode uses interrupts, but no color data

    .SKIPIRQ:
    ;CGB mode uses busy loops, but no interrupts

    ; Turn on LCD with tile data starting at 0x8000
    ld a, %10010001    ;LCD on, BG Tile Data 0x8000, BG ON
    ld [$ff40], a

    ret

PREVIOUSIMAGE:      ;Will jump back to previous image, will return via NEXTIMAGE
    ld a, [IMAGEINDEX]
    cp 1
    jr z, LASTIMAGE
    dec a
    dec a
    ld [IMAGEINDEX], a
    jr NEXTIMAGE

LASTIMAGE:   ;Will jump back to the last image, will return via NEXTIMAGE

    ;Load imagedata address for DMG or CGB mode
    ld a, [CGBMODE]
    and a
    jr nz, .LASTIMAGECGB
    ld hl, IMAGEDATADMGEND
    jr .LASTIMAGECGBEND
.LASTIMAGECGB:
    ld hl, IMAGEDATACGBEND
.LASTIMAGECGBEND:

    ld b, 0
    .LASTIMAGELOOP:
        dec b
        dec hl
        dec hl
        dec hl
        dec hl
        ld a, [hl]
        and a
        jr z, .LASTIMAGELOOP
    ld a, b
    ld [IMAGEINDEX], a
    jr NEXTIMAGE

FIRSTIMAGE:   ;Will jump back to the first image, will return via NEXTIMAGE
    ld a, 0
    ld [IMAGEINDEX], a

NEXTIMAGE:

    ;Load imagedata address for DMG or CGB mode
    ld a, [CGBMODE]
    and a
    jr nz, .NEXTIMAGECGB
    ld hl, IMAGEDATADMG
    jr .NEXTIMAGECGBEND
.NEXTIMAGECGB:
    ld hl, IMAGEDATACGB
.NEXTIMAGECGBEND:

    ld bc, 4
    ld a, [IMAGEINDEX]
    cp b

    .FINDIMAGELOOP:
        jr z, .FINDIMAGELOOPDONE
        add hl, bc
        dec a
        jr .FINDIMAGELOOP

    .FINDIMAGELOOPDONE:
    ld a, [hli]         ;First byte is bank of the image
    cp b
    jr z, FIRSTIMAGE    ;Unless it is zero, which is the end of the list
    ld [$2000], a       ;Switch to bank
    ld a, [hli]         ;Second and third byte is start of image data
    ld d, a
    ld a, [hli]
    ld e, a
    ld a, [hli]         ;Fourth byte is sleep time
    ld [IMAGESLEEP], a

    call LOADIMAGE

    ld a, [IMAGEINDEX]
    inc a
    ld [IMAGEINDEX], a

    ;Reset counter
    ld a, 0
    ld [FRAMECOUNTER], a
    ld [SCOUNTER], a
KNOWNRET:
    ret

GAMEPAD:
    ld hl, $ff00
    ld a, %00100000 ;Check direction keys
    ld [hl], a
    call KNOWNRET ;Burn 10 cycles by calling a ret directly
    REPT 3
        ld a, [hl]
    ENDR
    cpl
    and %00001111
    ld b, a
    ld a, %00010000 ;Check buttons
    ld [hl], a
    call KNOWNRET ;Burn 10 cycles by calling a ret directly
    REPT 3
        ld a, [hl]
    ENDR
    cpl
    and %00001111
    or b ;Now A/B and left/right are mapped onto the same bits :)

    jr nz, .DEBOUNCE
    ld [DEBOUNCE], a
    jr .JOYDONE
.DEBOUNCE:
    ld b, a
    ld a, [DEBOUNCE]
    and a
    jr nz, .JOYDONE
    ld a, b

    cp $01 ;Right pressed?
    jr nz, .NORIGHT
    ld [DEBOUNCE], a
    call NEXTIMAGE
    jr .JOYDONE
.NORIGHT:
    cp $02 ;Left pressed?
    jr nz, .NOLEFT
    ld [DEBOUNCE], a
    call PREVIOUSIMAGE
.NOLEFT:
.JOYDONE:
    ret

COUNTER:
    ;Increment frame and seconds counter and go to next image if necessary
    ld a, [FRAMECOUNTER]
    inc a
    ld b, 60
    cp b
    ld b, a
    jr nz, .COUNTERDONE_NOSCOUNTER ;Not yet 60 frames, so we do not reset FRAMECOUNTER and we do not touch SCOUNTER
    ld b, 0
    ld a, [SCOUNTER]
    inc a
    ld c, a
    ld a, [IMAGESLEEP]
    cp b
    jr z, .COUNTERDONE ;Image sleep is zero, so the image should not change automatically
    cp c
    jr nz, .COUNTERDONE ;Image sleep is non-zero, but does not match out second counter, so we are done for now
    call NEXTIMAGE ;Load next image and...
    ld b, 0        ;...reset both counters
    ld c, 0
.COUNTERDONE:
    ld a, c
    ld [SCOUNTER], a
.COUNTERDONE_NOSCOUNTER:
    ld a, b
    ld [FRAMECOUNTER], a
    ret

BEGIN:
    ; Disable interrupts during setup
    di

    ; Check if we are on a Game Boy Color
    ld b, a ; Store state of register a for CGB detection after initialization

    ;Wait for vblank
	WaitForMode %00000001

    ; Turn off LCD during setup
    ld a, %00010001    ;LCD off, BG Tile Data 0x8000, BG ON
    ld [$ff40], a

    ; BG tile palette.
    ; Experienced GB developmers may hate me for this as it is reverse to common use, but I find this much more intuitive with 00 being black and 11 being white.
    ld a, %00011011    ; Window palette colors
    ld [$FF47], a

    ;Enable LCD STAT interrupt as we will use LYC
    ld a, $40
    ld [$FF41], a
    ld a, $02
    ld [$FFFF], a

    ; Set scroll registers to zero
    ld a, 0
    ld [$FF42], a
    ld [$FF43], a

    ; Load tile map, which simply starts at 0, overflows once somewhere near the middle. We will switch the tile set to 0x8800 halfway through rendering later, so the overflow will point to other tiles.
    ld hl, $9800 ;Address of tile map
    ld a, 0 ;Tile index counter
    ld c, 18 ;Number of tile lines
    .TILEINDEX_LINE_LOOP:
        ld d, 20 ;Number of tile columns
        .TILEINDEX_COLUMN_LOOP:
            ld [hli], a
            inc a
            dec d
            jr nz, .TILEINDEX_COLUMN_LOOP
        ld de, 12
        add hl, de
        dec c
        jr nz, .TILEINDEX_LINE_LOOP

    ; Now let's see if we are on a CGB or a DMG
    ld a, b
    cp $11
    jr nz, DMGSTART        ; DMG

    ; CGB, enable double speed
    ld a, $01
    ld [$ff4d], a    
    stop
    jr CGBSTART         ; CGB (or GBA)




DMGSTART: ;DMG mode
    ld a, 0
    ld [CGBMODE], a
    call FIRSTIMAGE

DMGLOOP:
    ;Switch to tileset for first half of screen
    ld a, %10010001    ;LCD on, BG Tile Data 0x8000, BG ON
    ld [$ff40], a

    ;Set LYC to line 72 and wait for it
    ld a, $48
    ld [$FF45], a
    halt

    ;Switch to tileset for second half of screen
    ld a, %10000001    ;LCD on, BG Tile Data 0x8800, BG ON
    ld [$ff40], a

    ;Set LYC to line 144 and wait for it
    ld a, $90
    ld [$FF45], a
    halt

    call GAMEPAD
    call COUNTER

jr DMGLOOP


MACRO LOADPALETTE_IN_HBLANK
    pop de

    ;Wait for hblank
    WaitForMode %00000000

    ld [hl], e
    ld [hl], d
    
    REPT 15
        pop de
        ld [hl], e
        ld [hl], d
    ENDR
ENDM

CGBSTART: ;CGB mode
    ld a, 1
    ld [CGBMODE], a
    call FIRSTIMAGE

CGBLOOP:
    ;Switch to tileset for first half of screen
    ld a, %10010001    ;LCD on, BG Tile Data 0x8000, BG ON
    ld [$ff40], a

    ;Move sp out of the way and load palette data address into sp
    ld [STACKPOINTER], sp
    ld a, [PALETTEDATA]
    ld h, a
    ld a, [PALETTEDATA+1]
    ld l, a
    ld sp, hl

    ;Reset palette write target in BCPS
    ld a, $80 ;Auto-increment, address zero
    ld [$ff68], a

    ;Load first eight palettes before first line
    ld hl, $FF69
    REPT 32
        pop de
        ld [hl], e
        ld [hl], d
    ENDR

    ;Set palette write target in BCPS to palette 4 as we will first load 4-7 in the seconds scanline
    ld a, $a0 ;Auto-increment, address 0x10
    ld [$ff68], a

    ;Load palettes during first half of screen
    ld b, 71
    .LOOP_LINE1:
        ;Reset Palette index for even lines
        bit 0, b
        jr nz, .SKIP_PALETTE_INDEX_RESET1
        ld a, $80 ;Auto-increment, address zero
        ld [$ff68], a
        .SKIP_PALETTE_INDEX_RESET1:

        LOADPALETTE_IN_HBLANK

        dec b
        jr nz, .LOOP_LINE1

    ;Switch to tileset for second half of screen
    ld a, %10000001    ;LCD on, BG Tile Data 0x8800, BG ON
    ld [$ff40], a

    ;Load palettes during second half of screen
    ld b, 72
    .LOOP_LINE2:
        ;Reset Palette index for even lines
        bit 0, b
        jr nz, .SKIP_PALETTE_INDEX_RESET2
        ld a, $80 ;Auto-increment, address zero
        ld [$ff68], a
        .SKIP_PALETTE_INDEX_RESET2:

        LOADPALETTE_IN_HBLANK

        dec b
        jr nz, .LOOP_LINE2

    ;Restore sp
    ld a, [STACKPOINTER]
    ld l, a
    ld a, [STACKPOINTER+1]
    ld h, a
    ld sp, hl

    ;Wait for vblank
    WaitForMode %00000001

    call GAMEPAD
    call COUNTER

jp CGBLOOP


