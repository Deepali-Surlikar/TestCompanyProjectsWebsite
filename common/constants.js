'use strict';
function httpStatusCodes()
{

};

function appStatusCodes()
{

};

function constants()
{

};

function appStatusMessage()
{

};

httpStatusCodes.prototype = 
{
    Success : 200,
    BadRequest : 400,
    UserUnAuthorised : 401,
    Forbidden : 403,
    NotFound : 404,
    ApplicationError : 500,
};

appStatusCodes.prototype = 
{
    Application_Error : 1000,
    Mandatory_Field_Missing : 1001
};

appStatusMessage.prototype = 
{
    Application_Error : "Application error",
    Mandatory_Field_Missing : "Mandatory field missing"
};


constants.prototype = 
{
    HttpStatus : new httpStatusCodes( ),
    AppStatusCode : new appStatusCodes( ),
    AppStatusMessage : new appStatusMessage()
};

exports.Constants = new constants();