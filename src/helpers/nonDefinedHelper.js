class NonDefinedHelper {
    //I need a function that given an error message determines if the reason is beacause the called method is not defined. In order to do it, use regex to detect the words "is not a function"
    static IS_NOT_DEFINED(errorMessage) {
        // Check if the error message contains "is not a function"
        const regex = /is not a function/i;
        return regex.test(errorMessage);
    }
}

module.exports = NonDefinedHelper;