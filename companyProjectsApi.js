'use strict';
var databaseModule = require('../common/database');
var errorModule = require('../common/errorModule');
var constants = require('../common/constants').Constants; 
var xmlBuilder = require('xmlbuilder');

var response = {
    "Error" : {
                    "ErrorCode" : null,
                    "ErrorMessage" : null
              },
    "Data" : null
};

//getAllProjects API
exports.getAllProjects = async function (req, res, next)
{
    console.log("getAllProjects invoked ");

    var error = null;

    try
    {
        var noOfUsersToBeDisplayed = 3;

        var result = await databaseModule.knex.raw("CALL usp_get_all_projects(?)",noOfUsersToBeDisplayed);

        var responseData = [];
        var projectUsers = [];
        var projectUsersFilter = [];
        var projectUsersTotalCount = 0;
        var headsToBeDisplayed = 0;

        var projects = result[0][0];
        var projectsLength = projects.length;
        var project = {};

        for (var projectCount = 0;projectCount < projectsLength;projectCount++)
        {
            project = result[0][0][projectCount];

            //filter user list for the particular project
            projectUsers = filterArray(result[0][2],project.ProjectID,"ProjectID");

            projectUsersFilter = filterArray(result[0][1],project.ProjectID,"ProjectID");
            projectUsersTotalCount = projectUsersFilter ? projectUsersFilter[0].UserTotalCount : 0;
            headsToBeDisplayed = projectUsersTotalCount - noOfUsersToBeDisplayed;
            
            if(headsToBeDisplayed < 0)
            {
                headsToBeDisplayed = 0;
            }

            responseData.push({
                                "id" : project.ProjectID,
                                "project" : project.Name,
                                "formsubmitted" : project.FormsSubmittedCount,
                                "total" : projectUsersTotalCount,
                                "description" : project.Description, 
                                "count" : headsToBeDisplayed,
                                "profile" : projectUsers


            })
        }

        completeGetAllProjects(error, responseData,res);  
    }
    catch(tryCatchError)
    {
        console.log("getAllProjects try catch error " + tryCatchError);

        error = new errorModule.customError(constants.HttpStatus.ApplicationError, constants.AppStatusCode.Application_Error, constants.AppStatusMessage.Application_Error);
        
        completeGetAllProjects(error, null,res);  
    }
}

function filterArray(array, value, field)
{
    return array.filter(function (item)
    {
        return item[field] === value
    });
}

function completeGetAllProjects(error,data,res)
{
    console.log("completeGetAllProjects invoked");

    sendHTTPResponse(error,data,res);
}


//saveProjectDetails API
exports.saveProjectDetails = async function (req, res, next)
{
    console.log("saveProjectDetails invoked ");
    var error = null;

    try
    {
        var projectName = req.body.ProjectName;
        var projectDescription = req.body.ProjectDescription;
        var forms = req.body.Forms;
        var users = req.body.Users;
        var symbolReference = req.body.SymbolReference;
        var reminder = req.body.Reminder;

        //mandatory fields validation
        if(!projectName || !forms || !users || !symbolReference || !reminder)
        {
            console.log("mandatory fields missing ");

            error = new errorModule.customError(constants.HttpStatus.BadRequest, constants.AppStatusCode.Mandatory_Field_Missing, constants.AppStatusMessage.Mandatory_Field_Missing);
        
            await completeSaveProjectDetails(error, null,res);  

            return;
        }

        //ToDo form data validation - should be an array and the property should be same
        //ToDO can add the validation for max number of forms/users
        var formLength = forms.length;
        var formRef = null;
        var formDataXML = xmlBuilder.create('root')
        .ele('FormData');
        
        for (var formCount = 0; formCount < formLength ; formCount++)
        {
            formRef = forms[formCount].FormRef;
           
            formDataXML.ele('FormRef', formRef)
            .up()
        }
        formDataXML.end();


        var userLength = users.length;
        var userRef = null;
        var userDataXML = xmlBuilder.create('root')
        .ele('UserData');
        
        for (var userCount = 0; userCount < userLength ; userCount++)
        {
            userRef = users[userCount].UserRef;
           
            userDataXML.ele('UserRef', userRef)
            .up()
        }
        userDataXML.end();

        var result = await databaseModule.knex.raw("CALL usp_save_project_details(?,?,?,?,?,?)",[projectName,projectDescription,formDataXML.toString({ pretty: true }),userDataXML.toString({ pretty: true }),symbolReference,reminder]);

        completeSaveProjectDetails(error, result,res);  
    }
    catch(tryCatchError)
    {
        console.log("saveProjectDetails try catch error " + tryCatchError);

        error = new errorModule.customError(constants.HttpStatus.ApplicationError, constants.AppStatusCode.Application_Error, constants.AppStatusMessage.Application_Error);
        
        completeSaveProjectDetails(error, null,res);  
    }
}

function completeSaveProjectDetails(error,data,res)
{
    console.log("completeSaveProjectDetails invoked");

    response.Data = null;

    sendHTTPResponse(error,response.Data,res);
}


function sendHTTPResponse(error,data,res)
{
    console.log("sendHTTPResponse invoked");
    var errorType;
    if(error)
    {
        response.Error.ErrorCode = error.ErrorReasonCode;
        response.Error.ErrorMessage = error.ErrorReasonMessage;
        errorType = error.ErrorType;
    }
    else
    {
        response.Error = null;
        response.Data = data;
    }

    res.writeHead(errorType != null ? errorType : constants.HttpStatus.Success, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));

}
