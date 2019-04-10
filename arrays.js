/**
 * @module arrays
 *
 * Utilities for operating on array like objects
 */

/**
 * Extracts a given number of elements from the particular collection.
 * @param {Array} from collection to be extracted from
 * @param {Number} count number of elements to take from the head
 * @returns {Array} an array containing the first count of elements
 */
function first( from, count = 10 ){
	return [].concat(from).splice(0, count);
}

/**
 * Extracts the last number of elements from a given collection.
 * @param from {Array} collection to be extracted from
 * @param count {Number} number of element to extract
 * @returns {Array} an array containing the last count of elements
 */
function last( from, count = 10 ){
	return [].concat(from).splice(from.length - count, count);
}

module.exports = {
	first,
	last
};
