---
title: Coding Makes You Less Creative
description: Experienced software engineers have trained creativity out of their brains by building habits of clarity and predictability.
permalink: /coding-makes-you-less-creative.html
date: 2023-05-04
tags:
  - Philosophy
---

Every time I try to come up with an interesting and unique name for a new project I start drawing blanks. I released a daily fat counter app called Daily Fat Counter for Jobs' sake. There is a tendency to attribute creativity to software engineers because they invent novel solutions to real problems, but I believe that coding makes you less creative, exactly because it forces you to be predictable, clear and objective.

An experienced developer has built habits of controlling their creativity.

## Naming things and predictability

The hallmarks of good code are that it is clear, understandable and does what you expect. This is reflected in the clear naming of things like variables, classes and methods. If you create a class to decode JSON, then it better be called `JSONDecoder`. If your class is called something like `CrockfordsMagicBitMachine` might be fun and at least a little creative, but it doesn't help the user of your class, and in fact it actively hurts them.

Want to declare a variable that will hold a URL to a resource you are interested in? Then it better be named `url`. Actually, it would be much better if the name was more descriptive, such as including the name of the resource you are pointing to like `dog_ceo_api_url`.

What you are doing here is the opposite of creativity. Instead of trying to relate disparate concepts together in the readers mind, you are trying to fix the same single objective concept in every readers mind. There should be no room for interpretation in your
code.

I think doing this over and over again as a developer saps your mind of the ability to name things creatively, in a way that inspires many ideas the heads of your audience.

## Concise is clean and boring is better

If your code can do in 1000 lines what it can do in 10000 lines, then the 1000 lines is almost certainly better. The less features your software has, the better. Less is more.

These are rules are a bit arbitrary and do not always hold, but there are good reasons to follow them. More code means more bugs. The larger your codebase is, the longer it takes to work on. There is just more to read and more to understand. Programming languages themselves are abstractions that allow us to do more with less by working with broader concepts that are easier to reason about than a massive collection of smaller mechanisms. If I could write a program that consisted of a single
line of text input and accomplished the goal I wanted I would.

And what about style? What about that personal artistic flair? That's a code smell. We have style guides for a reason. I want your code to be boring. I want it to read like I wrote it or anyone else wrote it because it all looks exactly the same.

This too is the opposite of creativity. Following coding conventions, style guides and design patterns is a good thing. It makes it easy for you and for others to reason about and work on your code. It is not a good idea to interchangeably mix functional and object-oriented programming styles in the same codebase or even in the same function, unless the language calls for it. While it might show off your creative spark for coding, it increases the cognitive load on your reader by forcing them to hold more concepts in their head at once than necessary.

## It's not all bad

Programming can be a creative endeavour. It forces you to think outside the box to come up with unique approaches to problem solving. You can be incredibly creative in the way that you debug your software, or produce new design patters and architectures, or use APIs in unexpected ways, but the point of this article is to illustrate the point that programming trains your brain away from creativity. It rewards you for not giving your readers a fertile ground for their imagination, and I
can't help but think that's to blame every time I can't think of a cool name for my app.
