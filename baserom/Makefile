ASM	= rgbasm
LINK = rgblink
FIX = rgbfix

BINS	= baserom.gb

all:	$(BINS)

# Compile and link single file in one pass
%.gb:	%.asm
	$(ASM) -o $@.o $<
	$(LINK) -o $@ -n $@.sym $@.o
	$(FIX) -v $@
	echo 'let baserom = new Uint8Array([' > $@.js
	hexdump -ve '1/1 "0x%.2x,"' $@ >> $@.js
	echo ']);' >> $@.js

clean:
	rm -f *.o *.lst *.map *.gb *~ *.rel *.cdb *.ihx *.lnk *.sym *.noi, *.js

