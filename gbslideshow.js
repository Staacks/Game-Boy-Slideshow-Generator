const gbw = 160;
const gbh = 144;
var imageItems = new Array();

const elRoot = document.getElementById("gbslideshow");
const elImageList = document.createElement("div");
const elNewItem = document.createElement("div");
const elControls = document.createElement("div");

const downloadBtn = document.createElement("button");

class ImageItem {
    constructor(img) {
        let _this = this;

        this.root = document.createElement("div")
        this.root.classList.add("GBSL_imageItem");

        const originalControls = document.createElement("div");
        originalControls.classList.add("GBSL_original");

        this.canvasOriginal = document.createElement("canvas");
        this.canvasOriginal.classList.add("GBSL_GameBoyScreen");
        this.canvasOriginal.width = gbw;
        this.canvasOriginal.height = gbh;
        const context = this.canvasOriginal.getContext('2d');
        context.drawImage(img, 0, 0, gbw, gbh);
        originalControls.appendChild(this.canvasOriginal);

        this.root.appendChild(originalControls);

        const dmgControls = document.createElement("div");
        dmgControls.classList.add("GBSL_DMG");

        this.canvasDMG = document.createElement("canvas");
        this.canvasDMG.classList.add("GBSL_GameBoyScreen");
        this.canvasDMG.width = gbw;
        this.canvasDMG.height = gbh;
        dmgControls.appendChild(this.canvasDMG);

        const labelForDitherDMG = document.createElement("label");
        labelForDitherDMG.innerHTML = "Dither"
        this.ditherDMG = document.createElement("input");
        this.ditherDMG.type = "checkbox";
        this.ditherDMG.checked = true;
        this.ditherDMG.addEventListener("change", this.refreshDMG.bind(this));
        labelForDitherDMG.appendChild(this.ditherDMG);
        dmgControls.appendChild(labelForDitherDMG);

        const labelForBrightnessDMG = document.createElement("label");
        labelForBrightnessDMG.innerHTML = "Brightness"
        this.brightnessDMG = document.createElement("input");
        this.brightnessDMG.type = "range";
        this.brightnessDMG.min = -200;
        this.brightnessDMG.max = 200;
        this.brightnessDMG.value = 0;
        this.brightnessDMG.addEventListener("input", this.refreshDMG.bind(this));
        labelForBrightnessDMG.appendChild(this.brightnessDMG);
        dmgControls.appendChild(labelForBrightnessDMG);

        const labelForContrastDMG = document.createElement("label");
        labelForContrastDMG.innerHTML = "Contrast"
        this.contrastDMG = document.createElement("input");
        this.contrastDMG.type = "range";
        this.contrastDMG.min = 0;
        this.contrastDMG.max = 2;
        this.contrastDMG.step = 0.05;
        this.contrastDMG.value = 1;
        this.contrastDMG.addEventListener("input", this.refreshDMG.bind(this));
        labelForContrastDMG.appendChild(this.contrastDMG);
        dmgControls.appendChild(labelForContrastDMG);

        this.root.appendChild(dmgControls);

        const gbcControls = document.createElement("div");
        gbcControls.classList.add("GBSL_GBC");

        this.canvasGBC = document.createElement("canvas");
        this.canvasGBC.classList.add("GBSL_GameBoyScreen");
        this.canvasGBC.width = gbw;
        this.canvasGBC.height = gbh;
        gbcControls.appendChild(this.canvasGBC);

        const labelForBrightnessGBC = document.createElement("label");
        labelForBrightnessGBC.innerHTML = "Brightness"
        this.brightnessGBC = document.createElement("input");
        this.brightnessGBC.type = "range";
        this.brightnessGBC.min = -200;
        this.brightnessGBC.max = 200;
        this.brightnessGBC.value = 0;
        this.brightnessGBC.addEventListener("input", this.refreshGBC.bind(this));
        labelForBrightnessGBC.appendChild(this.brightnessGBC);
        gbcControls.appendChild(labelForBrightnessGBC);

        const labelForContrastGBC = document.createElement("label");
        labelForContrastGBC.innerHTML = "Contrast"
        this.contrastGBC = document.createElement("input");
        this.contrastGBC.type = "range";
        this.contrastGBC.min = 0;
        this.contrastGBC.max = 2;
        this.contrastGBC.step = 0.05;
        this.contrastGBC.value = 1;
        this.contrastGBC.addEventListener("input", this.refreshGBC.bind(this));
        labelForContrastGBC.appendChild(this.contrastGBC);
        gbcControls.appendChild(labelForContrastGBC);

        this.root.appendChild(gbcControls);

        const generalControls = document.createElement("div");
        generalControls.classList.add("GBSL_general");

        const labelForSleep = document.createElement("label");
        labelForSleep.innerHTML = "Seconds before next image"
        this.sleep = document.createElement("input");
        this.sleep.type = "number";
        this.sleep.min = 0;
        this.sleep.max = 255;
        this.sleep.step = 1;
        this.sleep.value = 5;
        this.sleep.addEventListener("change", function() {
            this.value = Math.max(0, Math.min(255, parseInt(this.value)));
        });
        labelForSleep.appendChild(this.sleep);
        generalControls.appendChild(labelForSleep);

        this.root.appendChild(generalControls);

        const listControls = document.createElement("div");
        listControls.classList.add("GBSL_listControls");

        const upBtn = document.createElement("button");
        upBtn.innerHTML = '&uarr;';
        upBtn.addEventListener('click', this.moveUp.bind(this));
        listControls.appendChild(upBtn);

        const downBtn = document.createElement("button");
        downBtn.innerHTML = '&darr;';
        downBtn.addEventListener('click', this.moveDown.bind(this));
        listControls.appendChild(downBtn);

        const delBtn = document.createElement("button");
        delBtn.innerHTML = 'X';
        delBtn.addEventListener('click', this.remove.bind(this));
        listControls.appendChild(delBtn);

        this.root.appendChild(listControls);

        this.refreshDMG();
        this.refreshGBC();
    }

    moveUp() {
        let i = imageItems.indexOf(this);
        console.log(i);
        console.log(imageItems);
        if (i > 0) {
            imageItems[i] = imageItems[i-1];
            imageItems[i-1] = this;
            elImageList.insertBefore(imageItems[i-1].root, imageItems[i].root);
        }
    }

    moveDown() {
        let i = imageItems.indexOf(this);
        console.log(i);
        console.log(imageItems);
        if (i < imageItems.length-1) {
            imageItems[i] = imageItems[i+1];
            imageItems[i+1] = this;
            elImageList.insertBefore(imageItems[i].root, imageItems[i+1].root);
        }
    }

    remove() {
        let i = imageItems.indexOf(this);
        this.root.remove();
        imageItems.splice(i, 1);
        refreshSizeEstimate();
    }

    refreshDMG() {
        this.generateDMG(this.ditherDMG.checked, parseFloat(this.brightnessDMG.value), parseFloat(this.contrastDMG.value));
    }

    refreshGBC() {
        this.generateGBC(parseFloat(this.brightnessGBC.value), parseFloat(this.contrastGBC.value));
    }

    luma2DMG(luma) {
        if (luma < 255/4)
            return 0x00;
        else if (luma < 255/2)
            return 0x01;
        else if (luma < 3*255/4)
            return 0x02;
        else
            return 0x03;
    }

    ditherSierra(ditherMap, x, y, error) {
        function applyAt(dx, dy, factor) {
            let xi = x + dx;
            if (xi >= gbw || xi < 0)
                return;
            let yi = y + dy;
            if (yi >= gbh)
                return;
            ditherMap[yi*gbw + xi] += error*factor/32;
        }
        applyAt(1, 0, 5);
        applyAt(2, 0, 3);
        applyAt(-2, 1, 2);
        applyAt(-1, 1, 4);
        applyAt(0, 1, 5);
        applyAt(1, 1, 4);
        applyAt(2, 1, 2);
        applyAt(-1, 2, 2);
        applyAt(0, 2, 3);
        applyAt(1, 2, 2);
    }

    generateDMG(dither, brightness, contrast) {
        this.dmgData = new Uint8Array(gbw*gbh/4);
        let ditherMap = new Array(gbw*gbh).fill(0);
        const src = this.canvasOriginal.getContext('2d');
        const imageData = src.getImageData(0, 0, gbw, gbh);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            let pixelIndex = Math.floor(i/4);

            let luma = (((0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2]) + brightness)-128) * contrast + 128;
            let pixel2bit = this.luma2DMG(luma + ditherMap[pixelIndex]);
            if (dither) {
                let error = luma - pixel2bit/0x03*255;
                this.ditherSierra(ditherMap, pixelIndex % gbw, Math.floor(pixelIndex/gbw), error);
            }
            let eightPixelBlock = Math.floor(pixelIndex/8);
            let dataIndex = 2*(Math.floor(eightPixelBlock/20) + 8 * (eightPixelBlock % 20) + 152 * Math.floor(eightPixelBlock / 160));
            this.dmgData[dataIndex] |= ((pixel2bit & 0x01) << (7-(pixelIndex % 8)));
            this.dmgData[dataIndex+1] |= ((pixel2bit >> 1) << (7-(pixelIndex % 8)));

            data[i]   = pixel2bit*255/3;
            data[i+1] = pixel2bit*255/3;
            data[i+2] = pixel2bit*255/3;
            data[i+3] = 255;
        }
        this.canvasDMG.getContext('2d').putImageData(imageData, 0, 0);
    }

    colorDistance(r1, g1, b1, r2, g2, b2) {
        const L1 = r1*0.2126 + g1*0.7152 + b1*0.0722;
        const L2 = r2*0.2126 + g2*0.7152 + b2*0.0722;
        const dL = L1-L2;
        const dr = (r1-r2)*0.2126;
        const dg = (g1-g2)*0.7152;
        const db = (b1-b2)*0.0722;
        return dr*dr + dg*dg + db*db + dL*dL * 2.0; //TODO Add option to weight luma over individual channels
    }

    paletteDistance(palette1, palette2) {
        let total = 0;
        for (let i = 0; i < 4; i++) {
            let minD1 = 1e99;
            let minD2 = 1e99;
            for (let j = 0; j < 4; j++) {
                let d1 = this.colorDistance(palette1[i][0], palette1[i][1], palette1[i][2], palette2[j][0], palette2[j][1], palette2[j][2]);
                let d2 = this.colorDistance(palette1[j][0], palette1[j][1], palette1[j][2], palette2[i][0], palette2[i][1], palette2[i][2]);
                if (d1 < minD1)
                    minD1 = d1;
                if (d2 < minD2)
                    minD2 = d2;
            }
            total += minD1*minD1 + minD2*minD2;
        }
        return total;
    }

    colorCentroid(colors, cluster) {
        let result = [0, 0, 0];
        for (let i = 0; i < cluster.length; i++) {
            for (let j = 0; j < 3; j++)
                result[j] += colors[cluster[i]][j];
        }
        for (let j = 0; j < 3; j++)
            result[j] = Math.round(result[j]/cluster.length);
        return result;
    }

    kMeansColorCluster(colors) {
        //Simple, maybe naive initialization
        let centroids = new Array();
        centroids.push(colors[Math.floor(Math.random() * colors.length)]);
        while (centroids.length < 4) {
            let maxI = 0;
            let maxD = 0;
            for (let i = 0; i < colors.length; i++) {
                let minD = 1e99;
                for (let j = 0; j < centroids.length; j++) {
                    let d = this.colorDistance(colors[i][0], colors[i][1], colors[i][2], centroids[j][0], centroids[j][1], centroids[j][2]);
                    if (d < minD) {
                        minD = d;
                    }
                }
                if (minD > maxD) {
                    maxI = i;
                    maxD = minD;
                }
            }
            centroids.push(colors[maxI]);
        }

        let converged = false;
        let iterations = 0;
        while (!converged && iterations < 100) {
            let clusters = [new Array(), new Array(), new Array(), new Array()];
            for (let i = 0; i < colors.length; i++) {
                let minIndex = 0;
                let minDist = 1e99;
                for (let j = 0; j < 4; j++) {
                    let d = this.colorDistance(colors[i][0], colors[i][1], colors[i][2], centroids[j][0], centroids[j][1], centroids[j][2]);
                    if (d < minDist) {
                        minDist = d;
                        minIndex = j;
                    }
                }
                clusters[minIndex].push(i);
            }
            converged = true;
            for (let j = 0; j < 4; j++) {
                if (clusters[j].length == 0)
                    continue;
                let newCentroid = this.colorCentroid(colors, clusters[j]);
                if (!(newCentroid[0] == centroids[j][0] && newCentroid[1] == centroids[j][1] && newCentroid[2] == centroids[j][2])) {
                    converged = false;
                    centroids[j] = newCentroid;
                }
            }
            iterations++;
        }
        return centroids;
    }

    kMeansPaletteCluster(palettes, colorsPerTile) {
        //Same as kMeansColorCluster, but now we are trying to cluster palettes.
        //Keep in mind, that we are not after finding the perfect colors as this can be done per line and not per tile, but we need to figure out, which of the 20 tiles can best share their line-wise palettes.
        let centroids = new Array();
        centroids.push(palettes[Math.floor(Math.random() * palettes.length)]);
        while (centroids.length < 8) {
            let maxI = 0;
            let maxD = 0;
            for (let i = 0; i < palettes.length; i++) {
                let minD = 1e99;
                for (let j = 0; j < centroids.length; j++) {
                    let d = this.paletteDistance(palettes[i], centroids[j]);
                    if (d < minD) {
                        minD = d;
                    }
                }
                if (minD > maxD) {
                    maxI = i;
                    maxD = minD;
                }
            }
            centroids.push(palettes[maxI]);
        }

        let converged = false;
        let iterations = 0;
        let clusters = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(), new Array(), new Array()];
        while (!converged && iterations < 100) {
            let newClusters = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array(), new Array(), new Array()];
            for (let i = 0; i < palettes.length; i++) {
                let minIndex = 0;
                let minDist = 1e99;
                for (let j = 0; j < 8; j++) {
                    let d = this.paletteDistance(palettes[i], centroids[j]);
                    if (d < minDist) {
                        minDist = d;
                        minIndex = j;
                    }
                }
                newClusters[minIndex].push(i);
            }
            converged = true;
            for (let j = 0; j < 8; j++) {
                if (newClusters[j].length == 0) {
                    clusters[j] = newClusters[j];
                    continue;
                }
                //Instead of calculating the mean of the palettes (whatever that would be), we use another cluster analysis to determine the ideal common palette of the new cluster
                let colors = new Array();
                for (let k = 0; k < newClusters[j].length; k++)
                    colors = colors.concat(colorsPerTile[newClusters[j][k]]);
                centroids[j] = this.kMeansColorCluster(colors);
                if (!(clusters[j].length === newClusters[j].length && clusters[j].every(function(value, index) { return value === newClusters[j][index]}))) {
                    converged = false;
                    clusters[j] = newClusters[j];
                }
            }
            iterations++;
        }
        return clusters;
    }

    generateGBC(brightness, contrast) {
        this.gbcData = new Uint8Array(gbw*gbh/4 + gbw/8*gbh/8/2 + (gbh+1)*32);
        const src = this.canvasOriginal.getContext('2d');
        const imageData = src.getImageData(0, 0, gbw, gbh);
        const data = imageData.data;
  
        const paletteMapOffset = gbw*gbh/4;
        const paletteDataOffset = paletteMapOffset + gbw/8*gbh/8/2;

        function adjust(c) {
            return Math.min(Math.max(((c+brightness)-128)*contrast+128,0),255);
        }

        //Group tiles by similar palettes and generate palette indices
        let paletteClusters = new Array();
        let paletteIndices = new Array();
        for (let tileRow = 0; tileRow < 18; tileRow++) {
            let tilePalettes = new Array();
            const tileRowOffset = 4*tileRow*8*gbw;
            let colorsPerTile = new Array();
            for (let i = 0; i < 20; i++) {
                let tileOffset = tileRowOffset + 4*8*i;
                let colors = new Array();
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        let pixelOffset = tileOffset + 4*(gbw*y + x);
                        let color = new Array();
                        color[0] = adjust(data[pixelOffset]);
                        color[1] = adjust(data[pixelOffset+1]);
                        color[2] = adjust(data[pixelOffset+2]);
                        colors.push(color);
                    }
                }
                let tilePalette = this.kMeansColorCluster(colors);
                tilePalettes.push(tilePalette);
                colorsPerTile.push(colors);
            }
            paletteClusters[tileRow] = this.kMeansPaletteCluster(tilePalettes, colorsPerTile).sort((a, b) => b.length - a.length);
            paletteIndices[tileRow] = new Array();
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < paletteClusters[tileRow][i].length; j++)
                    paletteIndices[tileRow][paletteClusters[tileRow][i][j]] = i;
            }
            for (let i = 0; i < 20; i+=2)
                this.gbcData[paletteMapOffset + 10*tileRow + i/2] = (paletteIndices[tileRow][i] << 4) | paletteIndices[tileRow][i+1];
        }
        

        //Line-wise generate palettes and tile data
        let currentPalettes = new Array(8);
        let fallBackPalette = [[0, 0, 0], [0x55, 0x55, 0x55], [0xaa, 0xaa, 0xaa], [0xff, 0xff, 0xff]];
        for (let y = 0; y < gbh; y++) {
            let tileRow = Math.floor(y/8);
            //Generate palettes
            let toBeGenerated = new Array();
            if (y == 0)
                toBeGenerated = [0, 1, 2, 3, 4, 5, 6, 7];
            else if (y % 2 == 0)
                toBeGenerated = [0, 1, 2, 3];
            else
                toBeGenerated = [4, 5, 6, 7];

            for (let ti = 0; ti < toBeGenerated.length; ti++) {
                let i = toBeGenerated[ti];

                function assembleColors(palette, y) { //Get all colors affected by this palette index in the given line
                    let colors = new Array();
                    let tileRow = Math.floor(y/8);
                    let paletteCluster = paletteClusters[tileRow][palette];
                    for (let j = 0; j < paletteCluster.length; j++) {
                        let tileColumn = paletteCluster[j];
                        for (let x = 0; x < 8; x++) {
                            let pixelIndex = gbw*y + tileColumn*8 + x;
                            colors.push([adjust(data[4*pixelIndex]),adjust(data[4*pixelIndex+1]),adjust(data[4*pixelIndex+2])]);
                        }
                    }
                    return colors;
                }

                let colors = assembleColors(i, y);
                if (!(y == gbh-1 || (y == 0 && i < 4))) { //Except for palettes 0-3 in the first line and the newly generated ones (4-7) in the last line, we have to take into account the pixels affected in the next row
                    colors = colors.concat(assembleColors(i, y+1));
                }

                if (colors.length == 0)
                    currentPalettes[i] = fallBackPalette;
                else {
                    currentPalettes[i] = this.kMeansColorCluster(colors);
                }

                let paletteData = new Uint8Array(8);
                for (let j = 0; j < 4; j++) {
                    let r5 = Math.round(currentPalettes[i][j][0] * 0x1f / 255);
                    let g5 = Math.round(currentPalettes[i][j][1] * 0x1f / 255);
                    let b5 = Math.round(currentPalettes[i][j][2] * 0x1f / 255);
                    let bgr555 = (b5 << 10) | (g5 << 5) | r5;
                    paletteData[2*j] = bgr555 & 0x00ff;
                    paletteData[2*j+1] = (bgr555 >> 8) & 0x00ff;
                }
                this.gbcData.set(paletteData, paletteDataOffset + (y == 0 ? 0 : 32) + 32*y + 8*ti);
            }

            //Generate tile data
            for (let x = 0; x < gbw; x++) {
                const pixelIndex = x + gbw*y;
                const bitShift = 7 - (pixelIndex % 8);
                const tileColumn = Math.floor(x/8);
                const eightPixelBlock = Math.floor(pixelIndex/8);
                let palette = currentPalettes[paletteIndices[tileRow][tileColumn]];

                let minD = 1e99;
                let bestColor = 0;
                for (let i = 0; i < 4; i++) {
                    let d = this.colorDistance(adjust(data[4*pixelIndex]), adjust(data[4*pixelIndex+1]), adjust(data[4*pixelIndex+2]), palette[i][0], palette[i][1], palette[i][2]);
                    if (d < minD) {
                        minD = d;
                        bestColor = i;
                    }
                }

                let dataIndex = 2*(Math.floor(eightPixelBlock/20) + 8 * (eightPixelBlock % 20) + 152 * Math.floor(eightPixelBlock / 160));
                this.gbcData[dataIndex  ] |= ((bestColor & 0x01) << bitShift);
                this.gbcData[dataIndex+1] |= ((bestColor >> 1) << bitShift);
            }
        }
        
        //Render preview image
        let palettes = new Array();
        for (let i = 0; i < 8; i++) {
            palettes[i] = new Array();
            for (let j = 0; j < 4; j++) {
                palettes[i][j] = new Array();
                let bgr555 = (this.gbcData[paletteDataOffset + 8*i + 2*j + 1] << 8) | this.gbcData[paletteDataOffset + 8*i + 2*j];
                palettes[i][j][0] = bgr555 & 0x001f;
                palettes[i][j][1] = (bgr555 >> 5) & 0x001f;
                palettes[i][j][2] = (bgr555 >> 10) & 0x001f;
            }
        }
        for (let y = 0; y < gbh; y++) {
            if (y > 0) {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        let bgr555 = (this.gbcData[paletteDataOffset + 32*(y+1) + 8*i + 2*j + 1] << 8) | this.gbcData[paletteDataOffset + 32*(y+1) + 8*i + 2*j];
                        palettes[(y % 2)*4 + i][j][0] = bgr555 & 0x001f;
                        palettes[(y % 2)*4 + i][j][1] = (bgr555 & 0x03e0) >> 5;
                        palettes[(y % 2)*4 + i][j][2] = (bgr555 & 0x7c00) >> 10;
                    }
                }
            }
            for (let x = 0; x < gbw; x++) {
                const pixelIndex = x + gbw*y;
                const bitShift = 7 - (pixelIndex % 8);
                const eightPixelBlock = Math.floor(pixelIndex/8);
                const dataIndex = 2*(Math.floor(eightPixelBlock/20) + 8 * (eightPixelBlock % 20) + 152 * Math.floor(eightPixelBlock / 160));
                const gbColor = ((this.gbcData[dataIndex] >> bitShift) & 0x01) | (((this.gbcData[dataIndex+1] >> bitShift) & 0x01) << 1 );
                const tileIndex = Math.floor(y/8)*gbw/8 + Math.floor(x/8);
                const paletteIndex = ((this.gbcData[paletteMapOffset + Math.floor(tileIndex/2)] << 4*(tileIndex % 2)) & 0x70) >> 4;
                data[4*pixelIndex  ] = palettes[paletteIndex][gbColor][0] * 0xff / 0x1f;
                data[4*pixelIndex+1] = palettes[paletteIndex][gbColor][1] * 0xff / 0x1f;
                data[4*pixelIndex+2] = palettes[paletteIndex][gbColor][2] * 0xff / 0x1f;
                data[4*pixelIndex+3] = 255;
            }
        } 
        this.canvasGBC.getContext('2d').putImageData(imageData, 0, 0);
    }
}

function addImageItem(img) {
    if (imageItems.length >= 254) {
        alert("Dude! This is a Game Boy, not Instagram. This tool cannot handle more than 254 images. I thought that's plenty.");
        return;
    }
    let newItem = new ImageItem(img);
    imageItems.push(newItem);
    elImageList.appendChild(newItem.root);
    refreshSizeEstimate();
}

function addImage() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var reader = new FileReader();
        reader.onload = function() {
            const image = new Image();
            image.src = reader.result;
            image.onload = function() {
                addImageItem(this);
            }
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    input.click();
}

function getRomSize(minimumSize) {
    let size = 0x8000;
    while (size < minimumSize)
        size <<= 1;
    return size;
}

function refreshSizeEstimate() {
    let size = getRomSize(0x4000*(imageItems.length+1));
    let sizeStr = (size >= 0x100000) ? ((size >> 20) + "MiB") : ((size >> 10) + "kiB");
    downloadBtn.innerHTML = 'Generate ROM ('+sizeStr+')';
    downloadBtn.disabled = imageItems.length == 0;
}

function generateROM() {
    const baseDMG = 0x1000;
    const baseGBC = baseDMG + 4*256;
    const n = imageItems.length;
    const imageSize = 2*gbw*gbh/4 + gbw/8*gbh/8/2 + (gbh+1)*32; //gbh*gbw/4; //TODO changes if DMG-only mode is added

    var romSize = getRomSize(0);
    var rom = new Uint8Array(0x8000);
    rom.set(baserom, 0);

    var memoryBank = 1; //Set to 1 even for bank 0 as this is reached via 0x0000..0x3fff anyway. A zero here indicates the end of the image list.
    var currentOffset = baseGBC + 4*256;  //TODO changes if DMG-only mode is added
    for (var i = 0; i < imageItems.length; i++) {
        if (currentOffset + imageSize >= (memoryBank+1)*0x4000) {
            memoryBank++;
            currentOffset = memoryBank*0x4000;
            if (currentOffset + imageSize > romSize) {
                romSize = getRomSize(currentOffset + imageSize);
                resizedRom = new Uint8Array(romSize);
                resizedRom.set(rom, 0);
                rom = resizedRom;
            }
        }
        inBankOffset = (currentOffset >= 0x8000) ? (0x4000 + currentOffset % 0x4000) : currentOffset;
        rom[baseDMG + 4*i] = memoryBank;
        rom[baseDMG + 4*i + 1] = (inBankOffset >> 8);
        rom[baseDMG + 4*i + 2] = (inBankOffset & 0xff);
        rom[baseDMG + 4*i + 3] = imageItems[i].sleep.value;
        rom[baseGBC + 4*i] = memoryBank;
        rom[baseGBC + 4*i + 1] = ((inBankOffset + gbw*gbh/4) >> 8);
        rom[baseGBC + 4*i + 2] = ((inBankOffset + gbw*gbh/4) & 0xff);
        rom[baseGBC + 4*i + 3] = imageItems[i].sleep.value;
        rom.set(imageItems[i].dmgData, currentOffset);
        rom.set(imageItems[i].gbcData, currentOffset + gbw*gbh/4);
        currentOffset += imageSize;
    }

    //Choose no MBC for 32kiB ROMs, but MBC5 for any other (MBC1 should be fine for most use cases, but since these are mostly compatible the biggest issue might be a verbose flashing software that issues a warning, so let's not clutter the interface with a highly technical option that is little more than just for "technical correctness".)
    rom[0x0147] = (romSize > 0x8000) ? 0x19 : 0x00;

    //Write ROM size to header
    let encoded = 0;
    while ((0x8000 << encoded) < romSize)
        encoded++;
    rom[0x0148] = encoded;

    //Header checksum (https://gbdev.io/pandocs/The_Cartridge_Header.html)
    let checksum = 0;
    for (let address = 0x0134; address <= 0x014C; address++) {
        checksum = checksum - rom[address] - 1;
    }
    rom[0x014d] = checksum & 0xff;

    //Calculate global checksum
    rom[0x014e] = 0x00;
    rom[0x014f] = 0x00;
    checksum = 0;
    for (let address = 0; address < romSize; address++)
        checksum += rom[address];
    rom[0x014e] = (checksum >> 8) & 0x00ff;
    rom[0x014f] = checksum & 0x00ff;

    //Download ROM
    const blob = new Blob([rom], {type: "application/octet-stream"});
    var link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "slideshow.gb"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupGUIDragAndDrop() {
    elRoot.addEventListener("dragenter", function(e) {
        event.stopPropagation();
        event.preventDefault();
        elRoot.classList.add("GBSL_drag");
    });
    elRoot.addEventListener("dragleave", function(e) {
        event.stopPropagation();
        event.preventDefault();
        elRoot.classList.remove("GBSL_drag");
    });
    elRoot.addEventListener("dragover", function(e) {
        event.stopPropagation();
        event.preventDefault();
    });
    elRoot.addEventListener("drop", function(e) {
        event.stopPropagation();
        event.preventDefault();
        elRoot.classList.remove("GBSL_drag");

        if (event.dataTransfer.files) {
            const imageType = /image.*/;
            for (var i = 0; i < event.dataTransfer.files.length; i++) {
                let file = event.dataTransfer.files[i];
                if (!file.type.match(imageType)) {
                    continue;
                }
                const reader = new FileReader();
                reader.onload = function() {
                    const image = new Image();
                    image.src = reader.result;
                    image.onload = function() {
                        addImageItem(this);
                    }
                }
                reader.readAsDataURL(file);
            }
        }
    });
}

function setupGUIImageList() {
    elImageList.id = "GBSL_imageList";
    elRoot.appendChild(elImageList);
}

function setupGUIControls() {
    elControls.id = "GBSL_controls";

    let addBtn = document.createElement("button"); 
    addBtn.innerHTML = 'Add image';
    addBtn.addEventListener('click', function() {
        addImage();
    });
    elControls.appendChild(addBtn);

    downloadBtn.innerHTML = 'Generate ROM';
    downloadBtn.addEventListener('click', function() {
        generateROM();
    });
    elControls.appendChild(downloadBtn);
    refreshSizeEstimate();

    elRoot.appendChild(elControls);
}

function setupGUI() {
    setupGUIImageList();
    setupGUIControls();

    setupGUIDragAndDrop();
}

setupGUI();
