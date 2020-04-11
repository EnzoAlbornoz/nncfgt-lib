# nncfgt-lib

This library implements the main functionalities that empowers **nncfgt** (acronym to Node NGINX Configuration Tool). It's focused on parsing and stringifying of NGINX configuration files besides defining basic abstractions to manipulate that data.

## 🤔 Motivation

As WEB Developer and Student I frequently need to edit my configuration files of NGINX server. Occurs that maintaining these files can became pretty difficult when complexity grows (multiple sites with different settings, multiple services like e-mail and webserver over the same instance). So, I've started this project to create a better interface that my scripts and other packages can interact to.

## 🧭 Code Style
This project uses the guidelines of Airbnb but with some changes like: "use strict" on files, double quotes, tabular indent, etc...
<br/>
They're all specified on [.editorconfig](.editorconfig), [.prettierrc.json](.prettierrc.json) and [.eslintrc.json](.eslintrc.json)

## ⚖️ License

This project licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Credits

This project was inspired by :
- [Crossplane](https://github.com/nginxinc/crossplane)
