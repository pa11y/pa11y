
# Pa11y CI Proposal

This is a proposal for another new Pa11y project. Before we get started, we should highlight that it's unlikely to progress until [Pa11y Sidekick] is closer to completion.

Pa11y CI will be a command-line tool which runs Pa11y against multiple URLs. It will be heavily geared towards easily running in CI environments against new versions of websites, but will also be runnable in local development.

Pa11y CI will also integrate tightly with Pa11y Sidekick, you will be able to push test results into your Sidekick dashboard as CI builds complete.

We've put together this document to gather feedback and input from the community. Please feel free to submit pull requests and provide feedback :)


## Table of Contents

  - [Principles](#principles)
  - [Outline](#outline)
  - [Roadmap](#roadmap)
    - [Proposal](#proposal-)
    - [Beta](#beta-)
    - [V1](#v1-)
  - [FAQs](#faqs)
  - [Feedback](#feedback)


## Principles

When gathering feedback and working on Pa11y CI, we aim to follow these guiding principles.

  - **Plan in the open**. We want to cater for real user needs.

  - **Develop in the open**. Pa11y CI will be open source from the [beta stage](#beta-).

  - **No knowledge silos**. We have some serious knowledge silos with the existing projects, and a lot of the code has a bus factor of one. Our documentation and guides need to be _way_ better for Pa11y CI.

  - **Make it easy to use**. We'd like it to be as easy as possible to get Pa11y CI working with your sites in common CI systems. E.g. [Travis], [CircleCI], [Jenkins].

  - **Keep it up to date**. Pa11y CI and its dependencies should be kept up to date.


## Outline

Here are a few features we'd like to propose:

  - **Run tests against multiple URLs**. You should be able to run tests against multiple URLs in parallel or sequence, with each URL optionally having its own configuration. Ideally you should be able to get these urls from any of these sources: a local JSON config file, a local sitemap file, a remote sitemap, a CSV.

  - **Fail CI builds if any one of the URLs has errors**. This should be configurable: so either the build fails _immediately_ if one URL has errors; all URLs are processed before deciding whether to fail or not; or the build doesn't fail but logs any errors.

  - **Integrate with existing CI services**. This could just be a documentation task, but we'd like to make it as easy as possible to add to your existing CI service.

  - **Integrate with Pa11y Sidekick**. We should add the ability to push results to a [Pa11y Sidekick] instance so that users can view output over time.

We envisage the CLI tool looking something like this (all assuming your app has been started on port `8080`):

```sh
pa11y-ci --source http://localhost:8080/sitemap.xml
```

```sh
pa11y-ci --source ./test-urls.json
```

```sh
pa11y-ci --source ./test-urls.json --sidekick https://your.sidekick/
```

Which could output something like:

```
> Running Pa11y CI
> (detected environment: Travis CI)
>
> Processing source (remote sitemap file)...
> Running Pa11y on 15 URLs...
>
> Results:
> ✔ http://localhost:8080/ - 0 errors
> ✔ http://localhost:8080/page - 0 errors
> ✘ http://localhost:8080/another-page - 2 errors
> [etc]
>
> Details:
> [error details]
>
> Publishing results to Pa11y Sidekick (https://your.sidekick/)...
> ✔ Results published
>
> ✘ 12/15 URLs passed
```


## Roadmap

There's a lot we _could_ add to the first version of Pa11y CI, but we're going to have to be realistic and come up with a roadmap. We've outlined the different stages we envisage this project going through below:

### Proposal ![proposal stage][status-badge-proposal]

Where we're at now. In this early stage of the project, we'd like to focus on community input and building an extended backlog of user needs that we want to cater for. At the end of this document is a [feedback section](#feedback) which we'd love you to fill out.

### Beta ![beta stage][status-badge-beta]

At beta stage, we'll have a working build of the library. We'll look for wider adoption and start considering the release process. Features at this stage of the project should be complete and well tested.

The code will be versioned with a `0` major version (`0.x.x`), and releases may include breaking changes. We'll communicate the start of the beta in the repo and via Twitter.

The purpose of this stage is to reach a level of stability and maintainability that will allow us to jump to `1.0.0`. Community participation and bug reports are essential at this point.

### V1 ![stable stage][status-badge-stable]

Version `1.0.0` will be stable, well tested, and a viable application to extend with all the features that didn't make it into this release.


## FAQs

We'll attempt to cover frequently asked questions here. If this section is thin on the ground, it's because we haven't been asked many yet.

### Why not add this to Pa11y itself?

We'd like to keep the [`pa11y`] command-line tool as simple as possible. It's already quite a complicated project and adding the ability to test multiple URLs is not something we want to do.

### How can I help?

In the early stages, by requesting features and discussing the ones already [over in the issues][issues]. Later we're going to need people to write code, tests, and documentation.

We're in the process of updating our website, which will have more information on contributing to Pa11y as a whole.

### Who are you?

We were originally a group of front end developers at [Nature Publishing Group]. Now we're dotted around London mostly. We'll link out to some kind of contact page once our website goes live.


## Feedback

Now that you've read through the proposal, we'd love your feedback!

  - Have an idea for a feature?
  - Want to help out?
  - Think we're doing this all wrong?

[Raise an issue on this repo][issues], or get in touch on [Twitter].

Additionally, feel free to open a pull request to suggest changes to the proposal.



[circleci]: https://circleci.com/
[issues]: https://github.com/pa11y/ci/issues
[jenkins]: https://jenkins.io/
[nature publishing group]: http://www.nature.com/
[`pa11y`]: https://github.com/pa11y/pa11y
[pa11y sidekick]: https://github.com/pa11y/sidekick
[status-badge-proposal]: https://img.shields.io/badge/status-proposal-red.svg
[status-badge-beta]: https://img.shields.io/badge/status-beta-yellowgreen.svg
[status-badge-stable]: https://img.shields.io/badge/status-stable-green.svg
[travis]: https://travis-ci.org/
[twitter]: https://twitter.com/pa11yorg
