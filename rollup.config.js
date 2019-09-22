import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'
import commonJs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'
import { minify } from 'uglify-es'//解决es6不能压缩


const pkg = require('./package.json')

const productionPlugins = [
	typescript({
		typescript: require('typescript'),
	}),
	replace({
		'process.env.NODE_ENV': "'production'",
	}),
	resolve(),
	uglify(
		{
			compress: {
				pure_getters: true,
				unsafe: true,
			},
			output: {
				comments: false,
				semicolons: false,
			},
			mangle: {
				reserved: ['payload', 'type', 'meta'],
			},
		},
		minify
	),
]

// minified production builds
const umdProduction = {
	input: 'src/index.ts',
	output: [
		{
			name: 'Rematch',
			file: pkg.browser,
			format: 'umd',
			exports: 'named',
			sourcemap: true,
		}, // Universal Modules
	],
	plugins: productionPlugins
}


const cjsProduction = {
	input: 'src/index.ts',
	output: [
		{
			file: `${pkg.main}/proxy.min.js`,
			format: 'cjs',
			exports: 'named',
			sourcemap: true,
		}, // CommonJS Modules
	],
	plugins: productionPlugins.concat(commonJs())
}


// full source development builds
const development = {
	input: 'src/index.ts',
	output: [
		{ file: `${pkg.main}/proxy.js`, format: 'cjs', exports: 'named' }, // CommonJS Modules
		{ file: pkg.module, format: 'es', exports: 'named', sourcemap: true }, // ES Modules
	],
	plugins: [
		typescript({
			typescript: require('typescript'),
		}),
		replace({
			'process.env.NODE_ENV': '"development"',
		}),
		resolve(),
	],
}

// point user to needed build
const root = `"use strict";module.exports="production"===process.env.NODE_ENV?require("./proxy.min.js"):require("./proxy.js");`

const rootFile = folder => {
	mkdirSync(join('dist', folder))
	writeFileSync(join('dist', folder, 'index.js'), root)
}

export default (() => {
	// generate root mapping files
	mkdirSync('dist')
	rootFile('cjs')

	return [development, umdProduction, cjsProduction]
})()