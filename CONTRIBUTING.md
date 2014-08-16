
How To Contribute
=================

pa11y accepts contributions from anyone, as long as you follow the guidelines below. If you'd like to contribute but aren't sure what there is for you to do, check the issue tracker for [things ready to be worked on][ready] and [known bugs][bugs].

It might be an idea to focus efforts on the goal of the [next milestone][milestones] before jumping onto anything too far ahead on the roadmap.


Features
--------

We won't accept features without prior discussion in the [issue tracker][issues]. Two heads are always better than one – this blanket rule stops you from spending your valuable time on features which may not make it back into pa11y.

If you want to fork the project and build on it by yourself, of course that's absolutely fine! Just don't expect your code to me merged back upstream :)


Refactoring/Rewriting
---------------------

We will accept refactors where it makes an improvement to the maintainability of the code-base or makes code more readable/understandable. If there's an argument about what's readable or not, chat about it in a pull-request.


Coding Guidelines
-----------------

* No trailing whitespace please (except in Markdown)
* Generally follow the style that is currently present in the code – consistency is important
* Keep indentation consistent (tabs)
* Don't commit code with lint errors (run `grunt lint` to run JSHint with the correct configurations)
* Don't commit code without passing tests (run `grunt test`).



[bugs]: https://github.com/nature/pa11y/issues?q=is%3Aopen+is%3Aissue+label%3Abug
[ready]: https://github.com/nature/pa11y/issues?q=is%3Aopen+is%3Aissue+label%3Aready
[issues]: https://github.com/nature/pa11y/issues
[milestones]: https://github.com/nature/pa11y/milestones
