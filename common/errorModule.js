'use strict';

function customError(errorType, errorReasonCode, errorReasonMessage)
{
    Error.call(this);
    
    this.ErrorType = errorType;
    this.ErrorReasonCode = errorReasonCode;
    this.ErrorReasonMessage = errorReasonMessage;
}

customError.prototype = Object.create(Error.prototype);
customError.prototype.ErrorType = null;
customError.prototype.ErrorReasonCode = null;
customError.prototype.ErrorReasonMessage = null;


exports.customError = customError;