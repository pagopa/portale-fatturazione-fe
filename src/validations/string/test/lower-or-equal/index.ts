import YupString from "../..";

const YupStringTestLowerOrEqual = (label: string, num: number) =>
    YupString.test(
        "lower-or-equal-to-number",
        `Il campo [${label}] deve essere minore o uguale a [${num}].`,
        function (value) {
            if (value) {
                if (parseInt(value) < num) return false;
                else return true;
            }
            return true;
        }
    );

export default YupStringTestLowerOrEqual;
