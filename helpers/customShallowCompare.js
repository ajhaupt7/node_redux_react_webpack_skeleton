import fetchKeys from 'lodash/keys'
import difference from 'lodash/difference'

function shallowEqual(objA, objB, ignoreProperties) {

    if (objA === objB) {
      return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    const keysA = ignoreProperties ? difference(fetchKeys(objA), ignoreProperties) : fetchKeys(objA);
    const keysB = ignoreProperties ? difference(fetchKeys(objB), ignoreProperties) : fetchKeys(objB);

    const len = keysA.length;
    if (len !== keysB.length) {
      return false;
    }
    // Test for A's keys different from B.
    const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
    for (let i = 0; i < len; i++) {
      const key = keysA[i];
      if (!bHasOwnProperty(key) || objA[key] !== objB[key]) {
        return false;
      }
    }

    return true;
};

export default function shallowCompare(instance, nextProps, nextState, ignoreProps, ignoreState) {
  return !shallowEqual(instance.props, nextProps, ignoreProps) || !shallowEqual(instance.state, nextState, ignoreState);
}