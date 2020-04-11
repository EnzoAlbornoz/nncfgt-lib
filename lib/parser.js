"use strict";

/**
 * Join tokens to make strings if possible
 * @example [`"`,`some`,`example`,`"`] -> `"some example"`
 * @param {Array<string>} stringTokens
 */
function prepareString(stringTokens = []) {
	const stringMarkers = [`'`, `"`];
	const stringMarkersStack = [];
	let currentString = "";
	stringTokens.forEach((token, idx) => {
		const nextToken = stringTokens[idx + 1];
		// -------
		if (stringMarkers.includes(token)) {
			let endingOfInternalString = false;
			if (
				stringMarkersStack.length &&
				stringMarkersStack[stringMarkersStack.length - 1] === token
			) {
				stringMarkersStack.pop();
				endingOfInternalString = true;
			} else {
				stringMarkersStack.push(token);
			}
			currentString = currentString
				.concat(token)
				.concat(
					endingOfInternalString &&
						nextToken &&
						!stringMarkers.includes(nextToken)
						? " "
						: ""
				);
		} else {
			currentString = currentString
				.concat(token)
				.concat(stringMarkers.includes(nextToken) ? "" : " ");
		}
	});
	return currentString;
}

/**
 * Extract tokens from line
 * @param {string} line
 */
function tokenizeLine(line) {
	// Define Reserved Chars
	const reservedChars = [";", "{", "}", `"`, `'`];
	// Define Array
	const chars = line.split("");
	// Setup Variables
	const tokens = [];
	let currentToken = "";
	// Process
	chars.forEach((char, idx) => {
		// const last = idx === chars.length - 1;
		const lastCharOfWord =
			chars[idx + 1] === " " ||
			chars[idx + 1] === undefined ||
			reservedChars.includes(chars[idx + 1]);
		// Cases of Processing
		if (reservedChars.includes(char)) {
			// Push new token
			tokens.push(char);
		} else if (!/\s/.test(char)) {
			// Push to current token if it isn't space
			currentToken = currentToken.concat(char);
		}

		// Check if last char of word/token
		if (lastCharOfWord && currentToken.length > 0) {
			// Commit token to tokens
			tokens.push(currentToken);
			// Reset Current Token
			currentToken = "";
		}
	});

	// Normalize Strings
	const normalizedStringTokens = [];
	const stringMarkers = [`"`, "'"];
	let currentStringMarker = null;
	let currentNSToken = [];
	tokens.forEach((token) => {
		// Add tokent to current token
		currentNSToken.push(token);
		// Check if String end or init
		if (stringMarkers.includes(token)) {
			// Check if it is ending
			if (currentStringMarker && token === currentStringMarker) {
				// End of String -> Prepare String -> Push new Token
				normalizedStringTokens.push(prepareString(currentNSToken));
				// Reset NS Token
				currentNSToken = [];
				currentStringMarker = null;
			} else if (!currentStringMarker) {
				// Set current marker
				currentStringMarker = token;
			}
		}

		// Push token if not in string
		if (!currentStringMarker && currentNSToken.length) {
			// End of String -> Prepare String -> Push new Token
			normalizedStringTokens.push(currentNSToken[0]);
			// Reset NS Token
			currentNSToken = [];
		}
	});

	// Returned Parsed Tokens
	return normalizedStringTokens;
}

/**
 * Tokenize a valid NGINX config
 * @param {string} content
 */
function tokenize(content = "") {
	// Split by lines
	const contentLines = content.split(/\n/);
	// Remove Comments
	const noCommentedLines = contentLines.map((line) => line.split("#")[0]);
	// Normalize Space
	const normalizedSpacedLines = noCommentedLines.map((line) =>
		line.replace(/\s\s+/g, " ").trim()
	);
	// Clear Empty Lines
	const fullFilledLines = normalizedSpacedLines.filter(
		(line) => !!line.length
	);
	// Tokenize Lines
	const tokenizedLines = fullFilledLines.map(tokenizeLine);
	// Get All Tokens
	const tokens = tokenizedLines.reduce((a, n) => a.concat(...n), []);
	// Return Token List
	return tokens;
}

/**
 *
 * @typedef {Object} ConfigEntry
 * @property {string} directive
 * @property {Array<string>} arguments
 * @property {Array<ConfigEntry>} block
 */

/**
 * Build a syntax tree from token list
 * @param {Array<string>} tokenList
 */
function buildSyntaxTree(tokenList = []) {
	// Initialize Syntax Tree
	/** @type {Array<ConfigEntry>} */
	const syntaxTree = [];
	/** @type {ConfigEntry} */
	let currentStatement = null;
	let blockStack = [];
	let captureStack = false;
	let captureBlocksQty = 0;
	// Iterate Over Token List
	tokenList.forEach((token) => {
		// Initialize Entry
		if (!currentStatement) {
			// Push New Entry
			currentStatement = {
				directive: token,
				arguments: [],
				block: [],
			};
		} else if (captureStack) {
			if (token === "{") {
				captureBlocksQty += 1;
				blockStack.push(token);
			} else if (token === "}") {
				captureBlocksQty -= 1;
				if (captureBlocksQty === 0) {
					// Parse Block
					const parsedBlock = buildSyntaxTree(blockStack);
					currentStatement.block.push(...parsedBlock);
					// Go to next statement
					syntaxTree.push(currentStatement);
					currentStatement = null;
					captureStack = false;
					blockStack = [];
				} else {
					blockStack.push(token);
				}
			} else {
				blockStack.push(token);
			}
		} else if (!captureStack) {
			if (token === "{") {
				// Start Capturing Block
				captureBlocksQty += 1;
				captureStack = true;
			} else if (token === ";") {
				// Go to next statement
				syntaxTree.push(currentStatement);
				currentStatement = null;
			} else {
				// Prepare Argument
				const toAddArg = Number.isNaN(Number(token))
					? token
					: parseInt(token, 10);
				currentStatement.arguments.push(toAddArg);
			}
		}
	});
	// Return Builded ST
	return syntaxTree;
}

/**
 * Converts a valid NGINX configuration
 * string into an object
 *
 * @param {string} content
 */
function parse(content = "") {
	// Tokenize Input
	const tokens = tokenize(content);
	// Build Syntax Tree
	const syntaxTree = buildSyntaxTree(tokens);
	// Log Operation
	return syntaxTree;
}

module.exports = parse;
