const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");
const sharp = require("sharp");
const outdent = require('outdent');

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
const stringifyAttributes = (attributeMap) => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};

module.exports = function(eleventyConfig) {
	eleventyConfig.addShortcode("image", async function imageShortcode(
		src,
		alt,
		sizes = "100vw",
		widths = [400, 800]
	) {
		let formats = ["avif", "webp", "jpeg"];
		let input;
		if(isFullUrl(src)) {
			input = src;
		} else {
			input = relativeToInputPath(this.page.inputPath, src);
		}

		let metadata = await eleventyImage(input, {
			widths: widths || ["auto"],
			formats,
			outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		});

		// TODO loading=eager and fetchpriority=high
		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

		return eleventyImage.generateHTML(metadata, imageAttributes);
	});

	eleventyConfig.addShortcode("animatedImage", async function animatedImageShortcode(
		src,
		alt,
		sizes = "100vw",
		widths = [400, 800],
		className = undefined,
	) {
		let input;
		if(isFullUrl(src)) {
			input = src;
		} else {
			input = relativeToInputPath(this.page.inputPath, src);
		}

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

		const sourceHtmlString = Object.values(metadata)
		// Map each format to the source HTML markup
			.map((images) => {
				// The first entry is representative of all the others
				// since they each have the same shape
				const { sourceType } = images[0];

				// Use our util from earlier to make our lives easier
				const sourceAttributes = stringifyAttributes({
					type: sourceType,
					// srcset needs to be a comma-separated attribute
					srcset: images.map((image) => image.srcset).join(', '),
					sizes,
				});

				// Return one <source> per format
				return `<source ${sourceAttributes}>`;
			})
			.join('\n');

		const imgAttributes = stringifyAttributes({
			src: input,
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
