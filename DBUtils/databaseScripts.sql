CREATE DATABASE companyProject;

use companyProject;

CREATE TABLE `symbol` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) NOT NULL,
  `Shape` varchar(50) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Reference_UNIQUE` (`Reference`)
);

CREATE TABLE `userprofile` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) NOT NULL,
  `Firstname` varchar(50) DEFAULT NULL,
  `Lastname` varchar(50) DEFAULT NULL,
  `Age` int(11) NOT NULL,
  `ImageURL` varchar(150) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Reference_UNIQUE` (`Reference`)
);

CREATE TABLE `project` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) NOT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Symbol` int(11) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Reference_UNIQUE` (`Reference`)
);


CREATE TABLE `forms` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) DEFAULT NULL,
  `Name` varchar(45) DEFAULT NULL,
  `SymbolID` int(11) NOT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`,`SymbolID`),
  UNIQUE KEY `Reference_UNIQUE` (`Reference`),
  KEY `fk_symbol_idx` (`SymbolID`),
  CONSTRAINT `fk_symbol` FOREIGN KEY (`SymbolID`) REFERENCES `symbol` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `projectforms` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) NOT NULL,
  `ProjectID` int(11) DEFAULT NULL,
  `FormID` int(11) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Reference_UNIQUE` (`Reference`),
  KEY `fk_form_idx` (`FormID`),
  CONSTRAINT `fk_form` FOREIGN KEY (`FormID`) REFERENCES `forms` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `projectusers` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Reference` varchar(36) NOT NULL,
  `ProjectID` int(11) DEFAULT NULL,
  `UserProfileID` int(11) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fx_userprofile_idx` (`UserProfileID`),
  CONSTRAINT `fx_userprofile` FOREIGN KEY (`UserProfileID`) REFERENCES `userprofile` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
);



/*			Stored Procedure 	*/
DELIMITER $$
CREATE PROCEDURE `usp_get_all_projects`(
IN paramNoOfUsersToBeDisplayed int
)
BEGIN

	select 	P.ID ProjectID
			,Name
			,Description
			,P.CreatedOn
            ,P.UpdatedOn
            ,count(PF.ID) as FormsSubmittedCount
    from project P  left join projectforms PF
    on P.ID = PF.ProjectID
	group by P.ID;
    
    select 	P.ID ProjectID
            ,count(PU.ID) as UserTotalCount
    from project P  
    left join projectusers PU 
    on P.ID = PU.ProjectID
	group by P.ID;
    
    select  ProjectID
			,firstname
			,lastname
            ,age
            ,imageURL
	from (SELECT P.ID ProjectID
				,firstname
				,lastname
				,age
				,imageURL 
				,@user_rank := IF(@current_project = P.ID, @user_rank + 1, 1) AS user_rank
				,@current_project := P.ID 
       FROM project P 
         join projectusers PU 
    on P.ID = PU.ProjectID
     join userprofile UP
       on PU.UserProfileID = UP.ID
     ) ranked
   WHERE user_rank <= paramNoOfUsersToBeDisplayed;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `usp_save_project_details`(
IN paramProjectName varchar(50),
IN paramDescription varchar(255),
IN paramFormReferenceData longtext,
IN paramUserReferenceData longtext,
IN paramSymbolReference varchar(36),
In paramReminder varchar(10)
)
BEGIN	
	DECLARE varProjectID int default null;
	DECLARE varFormPath varchar(100);
	DECLARE varFormRow_index int unsigned default 0; 
	DECLARE varFormRowcount int unsigned;
    
    DECLARE varUserPath varchar(100);
	DECLARE varUserRow_index int unsigned default 0; 
	DECLARE varUserRowcount int unsigned;
    
    DECLARE varDate datetime default utc_timestamp();
    
    SET Session TRANSACTION ISOLATION LEVEL READ COMMITTED;
	START TRANSACTION;
    
    
    INSERT INTO project
    (
		Reference,
        Name,
        Description,
        CreatedOn,
        UpdatedOn
	)
    Values
    (
		uuid(),
        paramProjectName,
        paramDescription,
        varDate,
        varDate
    );
    
    SELECT LAST_INSERT_ID() into varProjectID;
    
	SET varFormPath = '/FormData/FormRef';
    
	SET varFormRowcount  = extractValue(paramFormReferenceData, concat('count(', varFormPath, ')')); 
    
    WHILE varFormRow_index < varFormRowcount do  
    
    set varFormRow_index = varFormRow_index + 1; 
    
    INSERT INTO projectforms
		(
			Reference ,
			ProjectID,
            FormID,
            CreatedOn,
            UpdatedOn
		)
			select uuid(), 
				   varProjectID,
                   ID,
                   varDate,
					varDate
			from  forms
            where Reference = extractValue(paramFormReferenceData, concat('/FormData/FormRef[',varFormRow_index,']'));
            
     END WHILE;  
     
     SET varUserPath = '/UserData/UserRef';
    
	SET varUserRowcount  = extractValue(paramUserReferenceData, concat('count(', varUserPath, ')')); 
    
    WHILE varUserRow_index < varUserRowcount do  
    
    set varUserRow_index = varUserRow_index + 1; 
    
    INSERT INTO projectusers
		(
			Reference ,
			ProjectID,
            UserProfileID,
            CreatedOn,
            UpdatedOn
		)
			select uuid(), 
				   varProjectID,
                   ID,
                   varDate,
					varDate
			from  userprofile
            where Reference = extractValue(paramUserReferenceData, concat('/UserData/UserRef[',varUserRow_index,']'));
            
     END WHILE;  
     
     COMMIT;
END$$
DELIMITER ;




