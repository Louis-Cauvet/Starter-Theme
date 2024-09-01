# Starter-Theme 

> Before working, you need to have install [NodeJS](https://nodejs.org)

## Installation 
Execute the command ```npm install``` to charge on the project all dependencies listing in "package.json", 
and ```composer install``` to install Twig which is defined in "composer.json".

## Use
If all these technologies are correctly loaded, you can start working on the files that are located in "marmite-src" folder.

"marmite-src" is the place where you can modify the structure of Twig files, the Sass styles, the JS scripts or also upload images & fonts. 
For view tour code's results, you need to use Gulp tasks for minify, convert and transfer the "marmite-src" files into "marmite-dist" folder.

Here the list of Gulp's tasks (created in "gulpfile.js"):
- ```gulp html``` : Converts Twig files in "marmite-src" into HTML files for transferring them in "marmite-dist".
- ```gulp css``` : Minifies & converts "print.scss" & "styles.scss" files in "marmite-src" into "print.min.css" & "styles.min.css" files for transferring them in "marmite-dist".
- ```gulp js``` : Minifies "script-front.js" file in "marmite-src" into "script-front.min.js" file for transferring it in "marmite-dist".
- ```gulp images``` : Compress images (PNG, JPEG, GIF, SVG) in "marmite-src" for transferring them in "marmite-dist".
- ```gulp fonts``` : Tranfers fonts from "marmite-src" to "marmite-dist".

There is also 2 Gulp tasks which can helps you in your development part :
- ```gulp watch``` : Starts a looking task which can execute automatically the tasks listed above when a file is modified in "marmite-src".
- ```gulp start-server``` : Starts a local webserver with Google Chrome, accessible at the following url : http://localhost:8000/ if you want to view the HTML pages generated (you can also clicked directly on them for opening it in your favorite navigator).

## Good work !! ;)