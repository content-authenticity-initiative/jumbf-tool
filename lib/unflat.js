var _  = require('lodash');

var isobmff = require('./isobmff.json');


module.exports = function unflat (data) {

	var tree = [];

	_.forEach(_.sortBy(data, 'id'), function (obj, index, collection) {
		if ( obj.parent !== 0) {
			addToParent(obj, tree);
		} else {
			addToTree(obj, tree)
		}
	});

	return tree;
}





function addToParent (data, tree) {

	var parent = findById(data.parent, tree);

	if (parent) {
		addToTree(data, parent.content);
	}
}


function addToTree (data, tree) {
	// if the data is just a buffer of binary data, we currently output "BINARY_DATA"
	//	might be nice to have a CLI flag to output the actual data then too...
	content = (data.data instanceof Buffer) ? 'BINARY_DATA' : data.data;

	tree.push({
		id: data.id,
		type: data.type,
		content: (isobmff.boxContainers.indexOf(data.type) > -1) ? [] : content
	});
}


function findById (id, tree) {
	return _.reduce(tree, function (accumulator, item) {
		if (accumulator !== false) {
			return accumulator;
		}

		if (item.id === id) {
			return item;
		}

		if (item.content instanceof Array) {
			return findById(id, item.content)
		}

		return false;
	}, false);
}