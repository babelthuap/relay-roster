let findOneByPropValue = function(prop, value) {
  for (let i = 0; i < this.length; ++i) {
    if (this[i][prop] == value) return this[i];
  }
  return null;
}

let findAllByPropValue = function(prop, value) {
  let results = [];
  for (let i = 0; i < this.length; ++i) {
    if (this[i][prop] == value) {
      results.push(this[i]);
    }
  }
  return results;
}

let escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function filterCollection(collection, filter, filterBy, defaultFilter) {
  if (!filter) return collection;

  if (!filterBy) filterBy = defaultFilter;

  if (isNaN(Number(filter))) { // test for number input
    // Filter Collection Such That Letters Do Not Have To Be Consecutive!!!!
    let reRaw = '.*' + filter.split('').map(escapeRegExp).join('.*') + '.*';
    let re = new RegExp(reRaw, 'i');
    return collection.filter(item => re.test(item[filterBy]));
  } else {
    filter = Number(filter);
    return findAllByPropValue.call(collection, filterBy, filter);
  }
}

module.exports = {
  findOneByPropValue: findOneByPropValue,
  findAllByPropValue: findAllByPropValue,
  filterCollection: filterCollection
}
