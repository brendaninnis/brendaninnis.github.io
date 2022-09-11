---
layout: post
title: "What I Learned Publishing My First App"
description: "Lessons I learned about how to publish an app to the iOS App Store and Google Play Console by publishing my first app, Daily Fat Counter."
permalink: /what-i-learned-publishing-my-first-app.html
categories:
  - Mobile
tags:
  - iOS
  - App Store
  - Android
  - Play Store
---

As a mobile developer, I have built many apps as side projects in my spare time. These are usually for the purpose of learning some new peice of technology, or prototyping some quick idea I had in my head, but somehow I've gone my entire career without publishing an app that I owned. I decided recently that should change, so I developed and published by first app under my name to the Apple App Store and Google Play Store, [Daily Fat Counter](https://dailyfatcounter.brendaninnis.ca). 

There were many considerations to account for and tasks to accomplish beyond just developing the app, so here are a list of them that may be helpful for you when you decided to publish your first app.

## Consider creating accounts for your developer self.

You will need to provide contact information in various places and to various parties in the process of publishing your app. It will be in your Apple and Google Developer accounts, your contact information for your app listing, required for feedback during testing and others. In my case, I ended up using personal emails for these, however it is probably a good idea to setup an email account for use with your development work. That way you can publish these contact details widely without mixing your personal contacts with your development work. 

## You need a developer account.

The Apple Developer Program and Google Play Developer Accounts both require paying a fee. For Apple, this is $99USD yearly, and for Google it is a one-time fee of $25USD. Be careful with your Google Developer Account. If you don't use it after 1 year it will be expired permenantly and you will not be refunded. This happened to me because I signed up for the program with the intention to publish an app, but it took me much longer than I expected.

You should create your account early, since it will require some identity verification that will take some time before you will be able to publish any apps. There are also likely a few forms you will have to fill out for legal and tax purposes, so be prepared to spend some time reading and familiarizing yourself with them.

## What OS Versions Should I Support?

When building side projects for learning and fun, it is easy to simply develop only against whatever device you are planning to use to run your app. When you consider releasing your app in the wild, however, you suddenly must concern yourself with supporting a wide variety of devices.

The two main considerations when deciding what OS versions to support are what operating systems the ideal users of your app are using, and the amount of development effort required to support each version. For Daily Fat Counter, I wanted the app to be accessible to many people and the app is also small and not very complex, so the effort to support a wide array of operating systems is minimal and the payoff for doing so is well worth it.

On iOS I developed the entire app against iOS 15, which was preselected as the latest major iOS version. I was having fun learning Swift UI, and I was mainly considering my wife as the sole user. When it came time for release though, I decided to support back to iOS 14.0 so I could wouldn't leave out too many users on launch. There was a bit of effort to refactor the code to be compatible with 14.0, so it would have been a good idea to develop against this version from the start.

Considering Android, the backwards compatibility is quite good, especially with the Jetpack components. I ended up supporting all the way back to Android 5.1 (API 22) which covers 98% of devices according to Google. For a small app without a lot of complexity like Daily Fat Counter this turned out to be very easy. There is only one place where the code is different before Android 8.0, and that is concerning the datetime libraries.

## You need an app icon.

I'm an amateur graphic designer at best, so for my app icon I got creative and ended up using code to create it. I wrote a whole [blog post](https://dailyfatcounter.brendaninnis.ca/make-an-app-icon-with-swift-ui.html) about it, in case you want to try this yourself. Alternatively, there are free programs like GIMP which you can use to easily make a basic app icon. Be creative and don't fuss too much over it. The important thing is to make it simple and eye catching.

## You need screenshots.

The worst thing you could do for your app listing is to simply screenshot the app and post the minimum number of those images directly into your listing. You must at least put in the effort to show your screenshot running in a device frame, with some text describing the functionality of your app. For me, since I'm an amateur graphic designer, I ended up using a free Sketch template that I found using a Google search like: "Sketch template app store screenshots." I found one that
was suitable for my purpose, and I used it to create 40 screenshots (10 per device size factor and 2 size factors per platform) as well as using it to learn how to create and modify such a template in Sketch. Those same skills will be useful even in other design programs, and it was a great opportunity to learn more by following the example of others. This is always how I learn best.

This is the point in development when I decided not to support tablets. I realized that I had not put effort into making my UI appealing on large-form devices, and I was unwilling to show that UI in a screenshot. In the future, if I decide large-form device support is important, I will take the time to create a beautiful UI for those devices and spend the time to craft enticing screenshots for tablets.

## You need a website.

This was something I did not consider during development of my app, and it only hit me once I started putting together my app listing on Apple and Google for publishing. I put together a basic page with a description of the app, a screenshot and a link to the App Store and Play Store listings. I used already use Linode for hosting my personal blog, so I created a subdomain for my app and hosted it there. To supply an SSL certificate to enable HTTPS I used Cloudflare. I needed a website for 3 main reasons:

1. There is a URL field in your app listing that will be shown to users browsing the App Store or Play Store.
2. You need a place for your users to submit feedback during testing.
3. A privacy policy for your app must be hosted somewhere so it can be linked to in your app listing.

Speaking of privacy policies...

## You need a privacy policy.

The Apple App Store and Google Play Console both require you to declare and describe what user data your app collects and transmits to your backend. In order to comply with this declaration, a privacy policy is required. It is worth considering early on what user data your app will collect. This can easily affect you simply by inlcuding an analytics library such as Google Analytics. Consider all the third party libraries you include as well as any data which is persisted by your app.

For Daily Fat Counter, this was relatively simple. The app does not transmit any user data, and the only data which is collected is the daily fat records the user creates which is kept on device and able to be deleted at any time. The privacy policy simply states this.

## Plan to spend a good amount of time on your app listing.

Your app store listing can contain a lot of information, and it is prudent for you to invest a good amount of time working on your app's title, description and metadata. As a side-project, Daily Fat Counter will not be heavily promoted, and so one of the only ways for people to know about it will be through the app listing. You will want to consider how to use your title and subtitle to describe your app in short and semi-short terms. Your description can be quite long, and it is a good
opportunity for you to go in depth about your application and how user's can benefit from it. It may also not be immediately obvious which category your app fits into, so spend some time browsing through categories you think may be applicable to your app and see which category has apps that are the most similar to yours.

There are many great articles regarding app store optimization (ASO) and a quick Google search should give you many ideas and insights about how to tailor your app listing for optimal visibility.

## Organic growth is not dead.

I developed Daily Fat Counter for my wife. She was required to be on a fat-restricted diet, meaning she had to track the grams of dietary fat she consumed throughout each day. Daily Fat Counter helps users track the amount of fat they consume each day, as well as see a history of their fat consumption in relation to their goal. My ideal user story was Danielle's, and so it made the app easy to design as well as gave it a clear goal for success. If it is useful to her then it is a
success.

Now, if it can be useful to her, then surely there must be more people in the world like her who could benefit from it. If just one more person downloads and uses Daily Fat Counter, then it's impact has been doubled. That is how I define success for the app. I maintain a developer account already so I can publish other apps, and I maintain my website already in order to publish my blog, so Daily Fat Counter doesn't cost me anything beyond the occasional bit of development time to maintain
it and update it for newer OS versions (a non-trivial bit of effort.)

As far as the apps performance, though, it has garnered over 1000 impressions on the Apple App Store, resulting in over 100 installs, just over 2 months after release. On Google, the app has received about 300 impressions, resulting in 25 aquisitions in the same time, and it reports 9 active devices at present. I am very happy with these results. I have not done any paid promotion, or even any promotion at all of this app, beyond telling my wife that it's done and she can install it.

To me, each person that is positively impacted by the app is a blessing and I am grateful for each of them.

## Don't hoard your effort and talent to yourself, share it with the world.

Many people in the world can benefit from your unique gifts and your time on this earth. The thing I learned most from publishing my first app is that your time is valuable, and if you spend it all working on projects that only you ever see because you never publish them, then you've done a nice thing for yourself but no one else can benefit from what you've done.

If you are making something that is useful to you, then it will be useful to someone else, so share it with the world and let others benefit from your creations.
