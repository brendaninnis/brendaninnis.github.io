---
layout: post
title: "Build a static site with Jekyll"
description: "Learn how to build and host an awesome static site using Jekyll and GitHub Pages."
permalink: /build-a-jekyll-site.html
categories:
  - Web
tags:
  - Jekyll
  - Web
  - Side projects
---

Want to build an awesome static site like the one you are visiting right now? This post will explain step by step how I built this blog with Jekyll, installed a custom theme and hosted it on the web with GitHub pages. 

## Why Jekyll?

I've been wanting to put more work into building an online presence lately, so I decided I should start blogging. I have used WordPress in the past, and had a great experience with it. I built my own custom template for fun and something to write about, and I even hosted it from my house on an old Ubuntu box I had around. It was fun and a great learning experience, but this time around I was looking for something a little lighter -- something easier. I found Jekyll.

Jekyll is a static site generator written in Ruby and available as a gem. It allows you to write posts in markup and uses layouts to generate your static site. The end result is a databaseless, well formatted and indexable site with little or no Javascript that is up and running in no time. The cherry on top is that you can deploy your site to GitHub pages for free hosting and even use a custom domain.

## Getting started

There are excellent docs available at the [Jekyll site](http://jekyllrb.com) (I recommend doing at least some reading), but if you want a guide that covers every step from installation to deployment, this is it.

First install the bundler and start a new site:

```console
~ $ gem install bundler jekyll
~ $ jekyll new my-blog
~ $ cd my-blog
```

Once you are in your site directory you can start a development server:

```console
~/my-blog $ bundle exec jekyll serve
```

Now you can browse to http://localhost:4000 and see your site. A new Jekyll site contains example content that will teach you how to write posts and configure basic settings. This is very useful to read through.

## Install a theme

The default theme included with Jekyll is Minima, which is simple and effective, but if you're like me you'll want something a bit more exciting and a bit more personal. GitHub Pages has a list of [supported themes](https://pages.github.com/themes/), but there are many open-source themes available. [Jekyll Themes](http://jekyllthemes.org) is a wonderful resource for beautiful pre-built themes. For this site, I used [Hydeout](https://github.com/fongandrew/hydeout).

There are two ways to install and use a theme. I will explain both here and leave the decision about what's best up to you.

### Install a theme using a gem

When you install a theme with a gem, the guts of the theme are hidden outside of your project, and your theme can be updated by simply changing your Gemfile.

To install a theme, replace the Minima gem in your Gemfile (`my-blog/Gemfile`) with the appropriate gem for your theme.

```ruby
gem "jekyll-theme-hydeout", "~> 3.4"
```

Run `bundle install` to install the gem. You will also need to replace the theme in your `_config.yml` file.

```yaml
theme: jekyll-theme-hydeout
```

While we are in `_config.yml`, there are some important settings to add for the Hydeout theme.

```yaml
markdown: kramdown
highlighter: rouge

plugins:
  - jekyll-feed
  - jekyll-gist
  - jekyll-paginate

paginate: 5 # This will show posts on your home page
```

Hydeout also requires that you move your `index.md` file to `index.html` and replace the contents with the following:

```html
---
layout: index
title: My Title
---
```

Now run your site with `bundle exec jekyll serve` and you can see your new theme.

### Install a theme manually

If you would like to be able to edit the layout files of a theme, and have complete control over the result of your generated site, you can download a theme and install it manually. In the case of Hydeout this also provided me with much more sample content to work with and modify for my own use such as pages, sidebar links and posts.

Download the [Hydeout](https://github.com/fongandrew/hydeout/archive/v3.6.0.zip), or any other theme you like. Then simply copy contents of the theme into your project.

```console
~/my-blog $ cp -r ~/hydeout-master/* .
```

Run your site with `bundle exec jekyll serve`.

## Deploy your site to GitHub Pages

Jekyll makes it easy to deploy your website to GitHub pages. You will be able to host your site at https://yourgithubname.github.io or use any custom domain you own. Make sure you have git installed and you have a [GitHub](https://github.com) account. 

Create a repository for your site. The project name *must* be _username.github.io_ where _username_ is your GitHub username.

Initialize a repository in your project.

```console
~/my-blog $ git init
```

Before you add or commit any files, make sure to setup an appropriate `.gitignore` file. I used the `.gitignore` that was contained the [Hydeout](https://github.com/fongandrew/hydeout/blob/master/.gitignore) repository. Now you can add and commit your files, then push to your site to GitHub.

```console
~/my-blog $ git add .
~/my-blog $ git commit -m 'initial commit'
~/my-blog $ git remote add origin https://github.com/username/username.github.io
~/my-blog $ git push -u origin master
```

GitHub will build your site and publish it to https://username.github.io.


## Configure a custom domain

I registered a domain through GoDaddy. I was able to use a custom domain for my GitHub Pages site by configuring some DNS settings.

First, in the settings for your project on GitHub, scroll down to the GitHub Pages options and add your domain name in the text box then save.

In the DNS settings for my domain I added `A` records with the following ip addresses:
* 185.199.108.153
* 185.199.109.153
* 185.199.110.153
* 185.199.111.153

## Done

Actually you are far from done. You will want to give your site a great title and description, edit or add some pages and maybe write a post or two. I also added Disqus and Google Analytics to my site right away by adding a few lines to `_config.yml`. The source for this site is available on my [GitHub profile](https://github.com/brendaninnis?tab=repositories).

I'm also happy to answer any questions about how I built this website in the comments below or on my [Twitter](https://twitter.com/InnisBrendan).
