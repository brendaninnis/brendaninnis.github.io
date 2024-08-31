---
title: So I rebuilt my blog using Eleventy
description: I think I enjoy working on my blog more than I enjoy writing on it. I rebuilt it using Eleventy and it was pretty simple.
permalink: /so-i-rebuilt-my-blog-using-eleventy.html
date: 2024-08-30
tags:
	- Web
---

I realized that I have more tags than I do blog posts. As of this post, that is no longer true. Thankfully I tagged this post only `Web`. I discovered static site generators with Jekyll, which I used to build this blog at [brendaninnis.ca](https://brendaninnis.ca). Since then I've become unhappy with the version of the Hydeout theme I was using and I wanted to change up the look of my blog.

## Why Eleventy?

You want the truth? I did a Google search for _“Should I use Jekyll in 2024”_ and found some Reddit post where someone mentions Eleventy. When I checked out Eleventy it seemed much more barebones than Jekyll so I thought I could create a custom theme with a bit more ease. I also prefer managing packages with npm over RubyGems. Switching static site generators didn't seem like much of a lift since of course I was already using Markdown for my posts.

## The Good

The getting started page had me serving a basic site without trouble. Rather than pouring through the docs I decided just to fork the [Eleventy Base Blog](https://github.com/11ty/eleventy-base-blog) and just start importing my posts and seeing what happened. I pulled up a couple other tutorials, but I mostly skimmed them and took things with a grain of salt since many were written for older versions of Eleventy. Within the first day I was viewing a couple of my posts in the new template and starting to modify the theme. I really think the **Eleventy Base Blog** is a great starting point and exploring the config files will teach you a lot about how Eleventy works, but I will caveat this with the fact that the base blog template already had outdated (deprecated) parts of Eleventy that hand't been updated to the latest version.

## The Bad

The docs at [11ty.dev](https://www.11ty.dev) barely exist and essential features of the system have just a note written about them. Additionally, there is not an excess of material written about Eleventy on the web. There were a couple of other things that tripped me up and took me some time to solve.

### Images

I first couldn't get animated images to work. A few of my blog posts have example animated GIFs to demo some code. At first using the existing `eleventy-img` config in the **Eleventy Base Blog** the animated images were appearing as a still image of the first frame. I found the Eleventy documentation does include [a section on animated images](https://www.11ty.dev/docs/plugins/image/#output-animated-gif-or-webp) but while the example code produced an animated image, the generated metadata and resulting HTML had the wrong height. The solution I found was to use `Sharp` to get the correct height and width of the image and then generate my own HTML to display the image. I found [this blog post](https://www.aleksandrhovhannisyan.com/blog/eleventy-image-plugin/) very helpful for learning how to generate image HTML. You can find my image configuration on [my blog repo](https://github.com/brendaninnis/brendaninnis.github.io) if you're interested.

Aside from my difficulty with animated images, I still have no idea how the `sizes` attribute works (such as the example `"100vh"` given in the docs). If anyone understands image config in Eleventy well I would love an explanation.

### Syntax Highlighting

This one is my fault really. I wanted to learn how to apply a custom color scheme to my code blocks. The Eleventy docs give an example of using a custom PrismJS theme [here](https://www.11ty.dev/docs/plugins/syntaxhighlight/#installation), but I had an issue where the Eleventy Base Blog was applying another theme at the same time and I couldn't figure out where it was coming from. Eventually, exploring, I found it was included from node modules in the _post.njk_ layout, which makes sense. I removed that line, but I still can't understand how the theme ended up in _node_modules_ in the first place. Maybe it's a dependency of the `eleventy-plugin-syntaxhighlight` package? Again if someone can tell me how to find out I would appreciate it.

## Summing It Up

Honestly a few times felt like I was back learning to program for the first time when I just wanted to make websites and was getting lost in a sea of JS frameworks and build tools, but after getting through a few struggles Eleventy is actually a very easy and approachable SSG. Once I had my posts working and I was able to start tinkering with the theme I was having a lot of fun. I do enjoy the build system it's fast and has a nice watch mode.

Let me know what you think!

