---
layout: post
title: "Functions: Why Smaller is Not Always Better"
description: "A commentary on Robert C. Matin's Clean Code Chapter 3."
permalink: /functions-why-smaller-is-not-always-better.html
categories:
  - Mobile
  - Web
tags:
  - Clean Code
  - Software Engineering
  - Design
  - Functions
---

Throughout my career as a software engineer, I have come across many simple heuristics that developers use to guide their design decisions and inform their coding style. One such rule-of-thumb I have heard quoted is that "small functions are better". Those following this rule-of-thumb assert that writing small functions enforces good coding principals and makes for better software. While I would like my functions to be no larger than they need to be, I find the "small functions
are better" rule tends to create more problems than it solves.

Within Robert C. Martin's seminal work Clean Code, chapter 3 is dedicated to discussing the principals of clean code in relation to functions. Martin references the "small functions are better" rule within the chapter, and uses it, among other techniques, to refactor a function which is an example of code that could be cleaner. The function is as follows:

## The function to be refactored (Listing 3-1)

*HtmlUtil.java*
```java
public static String testableHtml(
        PageData pageData,
        boolean includeSuiteSetup
) throws Exception {
    WikiPage wikiPage = pageData.getWikiPage();
    StringBuffer buffer = new StringBuffer();
    if (pageData.hasAttribute("Test")) {
        if (includeSuiteSetup) {
            WikiPage suiteSetup =
                    PageCrawlerImpl.getInheritedPage(
                            SuiteResponder.SUITE_SETUP_NAME, wikiPage
                    );
            if (suiteSetup != null) {
                WikiPagePath pagePath =
                        suiteSetup.getPageCrawler().getFullPath(suiteSetup);
                String pagePathName = PathParser.render(pagePath);
                buffer.append("!include -setup .")
                        .append(pagePathName)
                        .append("\n");
            }
        }
        WikiPage setup =
                PageCrawlerImpl.getInheritedPage("SetUp", wikiPage);
        if (setup != null) {
            WikiPagePath setupPath =
                    wikiPage.getPageCrawler().getFullPath(setup);
            String setupPathName = PathParser.render(setupPath);
            buffer.append("!include -setup .")
                    .append(setupPathName)
                    .append("\n");
        }
    }
    buffer.append(pageData.getContent());
    if (pageData.hasAttribute("Test")) {
        WikiPage teardown =
                PageCrawlerImpl.getInheritedPage("TearDown", wikiPage);
        if (teardown != null) {
            WikiPagePath tearDownPath =
                    wikiPage.getPageCrawler().getFullPath(teardown);
            String tearDownPathName = PathParser.render(tearDownPath);
            buffer.append("\n")
                    .append("!include -teardown .")
                    .append(tearDownPathName)
                    .append("\n");
        }
        if (includeSuiteSetup) {
            WikiPage suiteTeardown =
                    PageCrawlerImpl.getInheritedPage(
                            SuiteResponder.SUITE_TEARDOWN_NAME,
                            wikiPage
                    );
            if (suiteTeardown != null) {
                WikiPagePath pagePath =
                        suiteTeardown.getPageCrawler().getFullPath (suiteTeardown);
                String pagePathName = PathParser.render(pagePath);
                buffer.append("!include -teardown .")
                        .append(pagePathName)
                        .append("\n");
            }
        }
    }
    pageData.setContent(buffer.toString());
    return pageData.getHtml();
}
```

My first and most immediate problem with the above code is the control flow resulting in many branching blocks which may or may not be executed during the course of this function. We end up with blocks which are nested many levels deep. This makes the function difficult to read since I have to keep track of which block of control flow I am in at a time, but more importantly, it is hard for me to keep the exponentially increasing paths through the logic in my head at once. Crucially, this function is also difficult to test, because it requires an exponentially increasing set of test cases in order to cover all of the possible branches.

The above function is not "bad" code. It does a good job of hiding away the implementation details of the task to render some HTML from the page data which is passed in as an argument. Some one line comments throughout the function describing what each step does would do a lot of work to make this function more readable and comprehensible.

It is an error to believe that all the problems of control flow required for branching logic can be solved by clean code. The fact is if your application requires branching logic, then your implementation will require some form of control flow and you can't get around that. How well your implementation is able to be comprehended and tested is what matters.

Martin eventually refactors the function using the principals of clean code, which results in a class with a static `render` function:

## Matin's refactor according to the principals of clean code (Listing 3-7)

*SetupTeardownIncluder.java*
```java
package fitnesse.html;
import fitnesse.responders.run.SuiteResponder;
import fitnesse.wiki.*;

public class SetupTeardownIncluder {
    private PageData pageData;
    private boolean isSuite;
    private WikiPage testPage;
    private StringBuffer newPageContent;
    private PageCrawler pageCrawler;
    public static String render(PageData pageData) throws Exception {
        return render(pageData, false);
    }
    public static String render(PageData pageData, boolean isSuite)
            throws Exception {
        return new SetupTeardownIncluder(pageData).render(isSuite);
    }
    private SetupTeardownIncluder(PageData pageData) {
        this.pageData = pageData;
        testPage = pageData.getWikiPage();
        pageCrawler = testPage.getPageCrawler();
        newPageContent = new StringBuffer();
    }
    private String render(boolean isSuite) throws Exception {
        this.isSuite = isSuite;
        if (isTestPage())
            includeSetupAndTeardownPages();
        return pageData.getHtml();
    }
    private boolean isTestPage() throws Exception {
        return pageData.hasAttribute("Test");
    }
    private void includeSetupAndTeardownPages() throws Exception {
        includeSetupPages();
        includePageContent();
        includeTeardownPages();
        updatePageContent();
    }
    private void includeSetupPages() throws Exception {
        if (isSuite)
            includeSuiteSetupPage();
        includeSetupPage();
    }
    private void includeSuiteSetupPage() throws Exception {
        include(SuiteResponder.SUITE_SETUP_NAME, "-setup");
    }
    private void includeSetupPage() throws Exception {
        include("SetUp", "-setup");
    }
    private void includePageContent() throws Exception {
        newPageContent.append(pageData.getContent());
    }
    private void includeTeardownPages() throws Exception {
        includeTeardownPage();
        if (isSuite)
            includeSuiteTeardownPage();
    }
    private void includeTeardownPage() throws Exception {
        include("TearDown", "-teardown");
    }
    private void includeSuiteTeardownPage() throws Exception {
        include(SuiteResponder.SUITE_TEARDOWN_NAME, "-teardown");
    }
    private void updatePageContent() throws Exception {
        pageData.setContent(newPageContent.toString());
    }
    private void include(String pageName, String arg) throws Exception {
        WikiPage inheritedPage = findInheritedPage(pageName);
        if (inheritedPage != null) {
            String pagePathName = getPathNameForPage(inheritedPage);
            buildIncludeDirective(pagePathName, arg);
        }
    }
    private WikiPage findInheritedPage(String pageName) throws Exception {
        return PageCrawlerImpl.getInheritedPage(pageName, testPage);
    }
    private String getPathNameForPage(WikiPage page) throws Exception {
        WikiPagePath pagePath = pageCrawler.getFullPath(page);
        return PathParser.render(pagePath);
    }
    private void buildIncludeDirective(String pagePathName, String arg) {
        newPageContent
                .append("\n!include ")
                .append(arg)
                .append(" .")
                .append(pagePathName)
                .append("\n");
    }
}
```

Martin says that "the first rule of functions is that they should be small." The heuristic seems to follow from the principals that functions should do one thing, not have side-effects and not mix levels of abstraction. While I agree with all of these principals, all can be adhered to without strictly sticking to a certain function size. Martin even goes so far as to suggest an upper limit of 20 lines.

A function should be as large as it needs to be in order to fulfill it's obligation. Functions can nicely hide away the implementation details of a single task, which may be numerous or cumbersome. As long as you are mostly just invoking the function, rather than operating on it's internals, why would it matter how large the function is? I would rather not look at the body of the function at all! Rather the function name and it's context in the code should cleanly express it's purpose. Further, if the function is well designed and written in the first place, then it's internals should not need much modification in the future.

The problems that I observe when developers religiously stick to the "smaller is better" rule are:
* lots of small functions lead to deep call stacks,
* implementation details get hidden in functions which are only called from one place,
* and functions become redundent wrappers for other function calls.

Let's discuss each of these points in relation to the above code (Listing 3-7) and refactor it again to be even cleaner.

## Lots of small functions lead to deep call stacks

When we take a large function and refactor it into many smaller functions, we often do it in a way where those smaller functions become nested within each other. The problem this leads to is that the smaller, deeply-nested functions are only called within the context of a call stack many levels deep.

Let's say I have never seen this code before, but I am tasked with changing something in the `buildIncludeDirective` function. In order to understand the context the function is called within I go back through the call stack, and I have to unnest each layer of it and understand them individually, in order to piece together what this function does in context. The call stack may end up looking like this:

```
SetupTeardownIncluder.render(PageData)
  SetupTeardownIncluder.render(PageData,boolean)
    SetupTeardownIncluder.render(boolean)
      SetupTeardownIncluder.includeSetupAndTeardownPages()
        SetupTeardownIncluder.includeSetupPages()
          SetupTeardownIncluder.includeSuiteSetupPage()
            SetupTeardownIncluder.include(String,String)
              SetupTeardownIncluder.buildIncludeDirective(String,String)
```

While breaking the original `testableHtml` (Listing 3-1) function into many smaller pieces does clean it up, it introduces the problem of deep call stacks that are difficult and time consuming to trace through. The problem is amplified in larger projects where the call stacks may be much deeper, and spread out across multiple classes or even packages.

## Implementation details get hidden in functions which are only called from one place

While separating levels of abstraction is a useful principle that does help the original monolithic `testableHtml` function become cleaner, the refactor introduces a new problem. The `buildIncludeDirective` function is only called from `include`. It is not reused anywhere else and so it should just be a part of the include function. Indeed it is just a part of the `include` function, but the implementation details are hidden away from `include` so that you have to look a level
deeper to understand what `include` actually does.

```java
private void include(String pageName, String arg) throws Exception {
    WikiPage inheritedPage = findInheritedPage(pageName);
    if (inheritedPage != null) {
        String pagePathName = getPathNameForPage(inheritedPage);
        buildIncludeDirective(pagePathName, arg);
    }
}

// . . .

private void buildIncludeDirective(String pagePathName, String arg) {
    newPageContent
            .append("\n!include ")
            .append(arg)
            .append(" .")
            .append(pagePathName)
            .append("\n");
}
```

There are other problems that `buildIncludeDirective` introduces in relation to clean code. It violates the "no side-effects" rule. The instance variable `newPageContent` is modified by the function and the only way to know that would be to look into the implementation details. In this case I would favour passing in the `StringBuffer` as an argument and let the function the modify it. This would make the intention of `buildIncludeDirective` clearer from the method
signature, as well as making the function more portable if it were to be reused elsewhere.

```java
private void buildIncludeDirective(StringBuffer content, 
                                   String pagePathName, 
                                   String arg) {
    content
            .append("\n!include ")
            .append(arg)
            .append(" .")
            .append(pagePathName)
            .append("\n");
}
```

A good rule-of-thumb for when it makes sense to break a piece of logic into it's own function is when it will be called in multiple places, or if the same logic is called with multiple variable arguments, like the `include` function for example. This, of course, would also be an example of the DRY (don't repeat yourself) rule.

## Functions become redundant wrappers for other function calls

One common symptom of the "smaller functions are better" mentality is functions which only call another function. They are, in essense, just a wrapper for another function, and are often redundent and simply clutter up your codebase and make it needlessly complicated. The `findInheritedPage` function from Listing 3-7 is an example of this problem as well as another function that is only called from one place.

```java
private void include(String pageName, String arg) throws Exception {
    WikiPage inheritedPage = findInheritedPage(pageName);
    if (inheritedPage != null) {
        String pagePathName = getPathNameForPage(inheritedPage);
        buildIncludeDirective(pagePathName, arg);
    }
}
private WikiPage findInheritedPage(String pageName) throws Exception {
    return PageCrawlerImpl.getInheritedPage(pageName, testPage);
}
```

What you might say in defence of `findInheritedPage` is that it does abstract away the implemntation details of how the `WikiPage` object is found from the page name, but in this case since this function is only called from one place and is essentially just a wrapper for the `PageCrawlerImpl.getInheritedPage` function I would rather the implementation just be a part of the `include` function.

These problems may seem not so bad in this small example, but it is in larger, real world projects these issues become amplified and add a large amount of complexity to a codebase, despite the intention to follow the principles of clean code.

## Comments are superior to many small functions

The small functions in the above examples were introduced in order to make the code more readable and understandable. They have descriptive names and focused tasks which help to make it clear what the code does, but they introduce the problems I have already outlined. A simpler approach to this refactor would be to just introduce some comments.

Comments will explain the purpose and function of each part of the implementation, just like a descriptively named function would, but without nesting logic another layer deep in the call stack or adding redundant wrappers to other function calls. Additionally, when reading through the large function, you will be able to read each step in order and understand the implementation details, rather than having to seach down through the function calls to the operation actually being
performed.

## Let's make the code cleaner

After understanding the problems introduced by developers religiously following the "small is better" rule, let's refactor the refactor from Clean Code and make it even cleaner.

```java
package fitnesse.html;
import fitnesse.responders.run.SuiteResponder;
import fitnesse.wiki.*;

public class SetupTeardownIncluder {
    private PageData pageData;
    private WikiPage testPage;
    private PageCrawler pageCrawler;
    private StringBuffer newPageContent;
    public static String render(PageData pageData) throws Exception {
        return render(pageData, false);
    }
    public static String render(PageData pageData, boolean isSuite)
            throws Exception {
        return new SetupTeardownIncluder(pageData).render(isSuite);
    }
    private SetupTeardownIncluder(PageData pageData) {
        this.pageData = pageData;
        testPage = pageData.getWikiPage();
        pageCrawler = testPage.getPageCrawler();
        newPageContent = new StringBuffer();
    }
    private String render(boolean isSuite) throws Exception {
        // If this is a test page, include the setup and teardown pages
        if (pageData.hasAttribute("Test"))
            includeSetupAndTeardownPages(isSuite);
        return pageData.getHtml();
    }
    private void includeSetupAndTeardownPages(boolean isSuite) 
            throws Exception {
        // Include setup pages
        if (isSuite)
            include(SuiteResponder.SUITE_SETUP_NAME, "-setup");
        include("SetUp", "-setup");

        // Include page content
        newPageContent.append(pageData.getContent());

        // Include teardown pages
        include("TearDown", "-teardown");
        if (isSuite)
            include(SuiteResponder.SUITE_TEARDOWN_NAME, "-teardown");

        // Update the page content
        pageData.setContent(newPageContent.toString());
    }
    private void include(String pageName, String arg) throws Exception {
        // Get The inherited page for the page name
        WikiPage inheritedPage = PageCrawlerImpl
            .getInheritedPage(pageName, testPage);
        // Avoid nesting ifs with early returns
        if (inheritedPage == null) return; 

        // Get the path name for the inherited page
        WikiPagePath pagePath = pageCrawler.getFullPath(inheritedPage);
        String pagePathName = PathParser.render(pagePath);

        // Build the include directive
        newPageContent
                .append("\n!include ")
                .append(arg)
                .append(" .")
                .append(pagePathName)
                .append("\n");
    }
}
```

While I do think that this logic could just be a simple function as in it's original form (Listing 3-1), I don't hate the class-based approach Martin used for the refactor. In the spirit of doing only the work necessary to accomplish the task, I have only refactored Listing 3-7 enough to remove the problems I highlighted above. The call stack necessary to trace through in order to understand the code has been greatly reduced, the implementation details of each function are easy to see in one place and there are no redundent wrapper functions contributing to clutter and complexity. I also added comments to make up for the "self-documenting" nature of the "many small functions" approach.

We should work on the code cleaning which provides the most benefit first, and stop before we reach the point of dimishing returns. With heuristics, we must remember that they are useful only until they are not. You must understand why the rule is useful, so that you can know when it is not.

I have compromised on some of the principals discussed by Martin in chapter 3 of Clean Code, such as the rule of keeping different levels of abstraction in different functions (e.g. in the `includeSetupAndTeardownPages`), however clean code is all about trade-offs. Clean code is best when we trade a small bit of extra effort for cleanliness today in order to save much more effort in the future, but it is easy to reach a point of diminishing returns or worse still to make your
code less clean by blindly applying heuristics.
