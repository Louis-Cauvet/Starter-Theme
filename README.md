# Starter-Theme 

> Before working, you need to have install [NodeJS](https://nodejs.org)

## Installation 
Execute the command ```npm install``` to charge on the project all dependencies listing in "package.json", 
and ```composer install``` to install Twig which is defined in "composer.json".

## Use
If all these technologies are correctly loaded, you can start working on the files that are located in "marmite-src" folder.

"marmite-src" is the place where you can modify the structure of Twig files, the Sass styles, the JS scripts or also upload images, fonts, audios... 
For view tour code's results, you need to use Webpack tasks for minify, convert and transfer the "marmite-src" files into "marmite-dist" folder.

Here the list of Webpack's tasks (configured in "webpack.config.js" & defined in the 'scripts' section of "package.json"):
- ```npm run webpack-build``` : Clears totally the files contained in "marmite-dist", & rebuild all the resources (Twig, SCSS, JS, SVG, images, fonts & audios) defined in "marmite-src".
- ```npm run webpack-watch``` : Starts a looking task which can execute automatically the compilation for the files that are modified in "marmite-src"

**Note** : If you want to view the HTML pages generated, you can right clicked directly on them for opening it in your favorite navigator.

## Good work !! ;)