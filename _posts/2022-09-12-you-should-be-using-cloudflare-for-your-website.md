---
layout: post
title: "You Should Be Using Cloudflare For Your Website"
description: "Cloudflare will speed up, protect and provide analytics for your website all for free. As a developer with a personal website Cloudflare is invaluable."
permalink: /you-should-be-using-cloudflare-for-your-website.html
categories:
  - Web
tags:
  - Website
  - Hosting
  - System Administration
  - Analytics
---

Cloudflare provides a free service that will speed up your website, protect you from attacks and provide analytics all for free and with an incredibly fast and easy setup; if you have a small or personal website you should be using Cloudflare. Cloudflare will give you an SSL certificate so your website can provide HTTPS, a CDN network that will cache your website around the world and deliver content to your users closest to their location (faster than your server), they will
manage your DNS and improve lookup time (further speeding up your users experience), they will provide you with analytics for free and without having to add any Google or other `<script>` tags to your code. I might be only scratching the surface of what Cloudflare can do and I might be late to the party, but let me explain how Cloudflare has helped me.

## Cloudflare Provides An SSL Certificate

Your users need to be able to connect to your site using HTTPS. They will not trust your site with a giant red 🔓 icon next to your URL. HTTPS requires an SSL certiciate, which can be complicated to obtain and setup, but Cloudflare provides and incredibly simple process to get a valid SSL certificate for your site as well as giving easy instructions with clear documentation to get you setup in no time.

For me, this was my first time setting up SSL myself, and using Cloudflare meant I had one less things to worry about when I wanted to deploy my website.

## Cloudflare Provides DNS Management, a CDN and Caches Your Website

When you setup Cloudflare, you transfer your nameservers from your domain registrars nameservers to Cloudflares. This means that Cloudflare provides your DNS management. I found Cloudflares DNS management to be simpler and more intuitive than my domain registrar, GoDaddy, and additionally, Cloudflare will proxy your DNS queries which will speedup your site's lookup time and also protect your server by masking your IP.

Cloudflare also operates as a CDN and caches your site's assets. I am hosting my site on Linodes cheapest shared server plan, including my personal blog, the Daily Fat Counter app website and Satle which gets hundreds of visitors per day. Cloudflare serves most requests from the cache, and so the load on my server is reduced by 3 times or more. This is incredibly useful for anyone with a small website and low-cost hosting.

## Cloudflare Provides Detailed Analytics For Free Without Any Setup

When you use Cloudflare to manage your DNS, as a bonus you get detailed analytics for your site including your daily/weekly/monthly unique visitos, total requests, country demographics and many more incredibly useful statistics for your website. For me, all I require for my site is basic analytics so I can see how much traffic the site is getting, and where it is coming from, so I don't need to install Google Analytics just for this purpose.

## Cloudflare Automatically Protects Your Website From Most Attacks

If you are like me, then you don't have experience mitigating attacks against your website, nor do you have the knowledge to easily identify and block them. Cloudflare automatically protects your website from many common attacks that could be made against your website. DNS proxy and CDN cacheing both help defend your server from being overloaded and brought down.

According to Cloudflare, 7 attacks against my site were blocked in the past month. Nice! 👍

## Cloudflare Optimizes Your Code For You

Another free and automatic service provided by Cloudflare, if you choose to enable it, is optimization and minification of your code. Cloudflare takes your HTML, CSS and JavaScript assets and will serve optimized versions of them automatically for you, and update them whenever you update your source code. This is just another way that Cloudflare saves you bandwidth and improves load times for your users.

## Cloudflare is Free, Easy and Just Awesome

The amount of value Cloudflare is offering for free is insane, and the fact that it requires almost no commitment from you makes it, in my opinion, an obvious choice to use. This is not like a service like Firebase that requires itself to be embedded in your product, so that when your product takes off you will be charged a lot and it won't be easy to remove. Cloudflare offers a simple service that is easy to setup and anytime you want you could easy just move your nameservers back
to your registrar and leave Cloudflare behind, but why would you?
