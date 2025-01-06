# Game Boy Slideshow Generator

Create slideshow ROMs for your Game Boy directly in your browser. This allows you to simply drag your images into your webbrowser, adjust brightness and contrast to your liking and download a Game Boy compatible ROM containing a slideshow of your images. The generated ROM is a hybrid one, providing dithered grayscale images for grayscale Game Boys (i.e. DMG, Pocket, etc.) as well as colored images for the Game Boy Color and the Game Boy Advance's GBC compatibility mode.

The grayscale mode uses mid-frame tileset switching to provide fullscreen images and the color mode even does palette swaps during h-blank, allowing for much more colorful images than just using the GBS's eight 4-color palettes statically.

<a href="https://www.buymeacoffee.com/there.oughta.be" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" height="47" width="174" ></a>

# How to use it

Either download the content of this repository to your computer and open `gbslideshow.html` in your webbrowser or visit [https://there.oughta.be/a/game-boy-slideshow](there.oughta.be/a/game-boy-slideshow) for a conveniently hosted version (you can also use the short URL [https://x-b.it/gbs](x-b.it/gbs)).

Simply use the "Add image" button or drag your images into your browser to add new images. You can try the sliders to adjust the image's look and can see the effect immediately. Below each image you can enter the desired time (in seconds) each image should be shown. If you set this to zero, this particular image will not advance automatically. (On your Game Boy can always use left/right or A/B to go forth and back in your slideshow.)

If your are done, you can press "Generate ROM" at the bottom and the ROM with your images should show up as a download in your browser.

You can use this ROM on any Game Boy that is compatible with the old Game Boy or Game Boy Color cartriges by writing it to a simple flash cart or multi-game carrts like the EZ Flash or the Everdrive. You can also run the ROM in an emulator or copy it to devices that can directly play ROM files (like the Analogue Pocket).

# ROM size and compatibility

Please note that the ROM size depends on the number of images. At the moment, there is no option to disable color support and each image takes up one bank of memory, i.e. 16kB per image (+16kB for the machine code). A single image is compatible with simple 32kB EEPROMs and does not require a memory bank controller (the generator will set the appropriate header data of the ROM file). If there are more images, the generator will set the MBC in the ROM's header to MBC-5, but most other MBCs (for example MBC-1) should be compatible.

# Building the project

The JavaScript code has just been written into a text editor and is included in the HTML file as is. Nothing needs to be done to build it, but it is butt ugly.

However, it requires a template ROM, written in assembly, which is included as "baserom.gb.js". This is created from the assembly file in the "baserom" directory. This ROM is built with rgbasm and you will find a build script in the baserom directory, which builds the ROM and also generates the JavaScript version "baserom.gb.js" from it. This uses the `hexdump` CLI tool and I have no idea if it is available outside of Linux systems - if not, you may need to find another tool or write a little script to store the binary data in a js file.

# License

The code is open under the GNU General Public License v3.0 (see LICENSE file).

