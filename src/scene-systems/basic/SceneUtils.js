import VecUtils from "../utils/VecUtils.js";

class SceneUtils {
    static sortByDistance(sourceData) {
        let { entities, refPoint, direction } = sourceData;

        return entities.sort((first, second) => {
            const firstEntityDistanceFromOrigin = VecUtils.distance(first.position, refPoint);
            const secondEntityDistanceFromOrigin = VecUtils.distance(second.position, refPoint);

            switch (direction) {
                case "from":
                    return firstEntityDistanceFromOrigin - secondEntityDistanceFromOrigin;
                case "to":
                    return secondEntityDistanceFromOrigin - firstEntityDistanceFromOrigin;
            }
        });
    }
}

export default SceneUtils;
