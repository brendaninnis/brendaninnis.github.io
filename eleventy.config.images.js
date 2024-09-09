const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");
const sharp = require("sharp");
const outdent = require('outdent');

function inputFromSrc(src, page) {
    if(isFullUrl(src)) {
        return src;
    } else {
        return relativeToInputPath(page.inputPath, src);
    }
}

function relativeToInputPath(inputPath, relativeFilePath) {
	let split = inputPath.split("/");
	split.pop();

	return path.resolve(split.join(path.sep), relativeFilePath);
}

function isFullUrl(url) {
	try {
		new URL(url);
		return true;
	} catch(e) {
		return false;
	}
}

/** Maps a config of attribute-value pairs to an HTML string
 * representing those same attribute-value pairs.
 */
function stringifyAttributes(attributeMap) {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};

function getLargestImage(metadata, format) {
    const images = metadata[format];
    return images[images.length - 1];
}

function buildSourceString(images, darkImages, sizes) {
    return darkImages
        .map((images) => {
            const { sourceType } = images[0];
            const sourceAttributes = stringifyAttributes({
                type: sourceType,
                srcset: images.map((image) => image.srcset).join(', '),
                sizes,
                media: '(prefers-color-scheme: dark)',
            });

            return `<source ${sourceAttributes}>`;
        })
        .concat(images.map((images) => {
            const { sourceType } = images[0];
            const sourceAttributes = stringifyAttributes({
                type: sourceType,
                srcset: images.map((image) => image.srcset).join(', '),
                sizes,
            });

            return `<source ${sourceAttributes}>`;
        }))
        .join('\n');
}

module.exports = function(eleventyConfig) {
	eleventyConfig.addShortcode("image", async function imageShortcode(
		src,
		alt,
        darkSrc = null,
		sizes = "100vw",
		widths = [400, 800]
	) {
		const formats = ["avif", "webp", "jpeg"];
		const input = inputFromSrc(src, this.page);

		const metadata = await eleventyImage(input, {
			widths: widths || ["auto"],
			formats,
			outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		});
        const darkMetadata = darkSrc ? await eleventyImage(inputFromSrc(darkSrc, this.page), {
            widths: widths || ["auto"],
            formats,
            outputDir: path.join(eleventyConfig.dir.output, "img"),
        }) : {};

        const sourceHtmlString = buildSourceString(Object.values(metadata), Object.values(darkMetadata), sizes);
        
        const largestUnoptimizedImg = getLargestImage(metadata, formats[0]);
		const imgAttributes = stringifyAttributes({
			src: largestUnoptimizedImg.url,
			width: largestUnoptimizedImg.width,
			height: largestUnoptimizedImg.height,
			alt,
			loading: 'lazy',
			decoding: 'async',
		});
		const imgHtmlString = `<img ${imgAttributes}>`;
		const picture = `<picture>
			${sourceHtmlString}
			${imgHtmlString}
		</picture>`;

		return outdent`${picture}`;

	});

	eleventyConfig.addShortcode("animatedImage", async function animatedImageShortcode(
		src,
		alt,
		sizes = "100vw",
		widths = [400, 800],
		className = undefined,
	) {
        const input = inputFromSrc(src, this.page);

		// Get the correct dimensions using sharp
		const image = sharp(input);
		const sharpMetadata = await image.metadata();
		const { width, height } = sharpMetadata;

		let metadata = await eleventyImage(input, {
			widths: widths || ["auto"],
			formats: ["webp"],
			outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
			sharpOptions: {
				animated: true
			},
		});

		const sourceHtmlString = buildSourceString(Object.values(metadata), [], sizes);

        const largestUnoptimizedImg = getLargestImage(metadata, "webp");
		const imgAttributes = stringifyAttributes({
			src: largestUnoptimizedImg.url,
			width: width,
			height: height,
			alt,
			loading: 'lazy',
			decoding: 'async',
		});
		const imgHtmlString = `<img ${imgAttributes}>`;

		const pictureAttributes = stringifyAttributes({
			class: className,
		});
		const picture = `<picture ${pictureAttributes}>
			${sourceHtmlString}
			${imgHtmlString}
		</picture>`;

		return outdent`${picture}`;
	});

};
