/**
 * Create and returns a new operation
 * 
 * @param {String} 	 [opType] 		the code of the operation to launch
 * @param			 [opValues] 	an object specifying values for the operation's fields
 * 
 * @return {JSRecord<db:/ma_log/operationlog>} the operation, or <code>null</code> if it could not be started
 * 
 * @properties={typeid:24,uuid:"5B2105F8-A267-4F0F-9B18-FE9D3F2A2440"}
 */
function getNewOperation(opType, opValues)
{
	/** @type {JSFoundSet<db:/ma_log/operationuser>} */
	var operationUserFs = databaseManager.getFoundSet(globals.Server.MA_LOG, 'operationuser');
	if(!operationUserFs)
		return null;
	
	databaseManager.startTransaction();
	
	/**
	 * Memorize the operation's relevant information
	 */
	var newOperationUser = operationUserFs.getRecord(operationUserFs.newRecord());
		newOperationUser.op_id = application.getUUID().toString().toLowerCase();
		newOperationUser.user_id = security.getUserName()
		newOperationUser.client_id = security.getClientID();
		
	var newOperation = newOperationUser.operationuser_to_operationlog.getRecord(newOperationUser.operationuser_to_operationlog.newRecord());
		newOperation.op_start = new Date();
		newOperation.op_progress = 0;
		newOperation.op_lastprogress = newOperation.op_start;
		newOperation.op_status = globals.OpStatus.ONGOING;
		newOperation.op_type = globals.getOpType(opType);
		newOperation.op_message = newOperation.operationlog_to_operationtype.descrizione;
		newOperation.op_hash =  utils.stringMD5HashBase64(newOperationUser.op_id);
			
	if(opValues)
	{
		for(var p in opValues)
		{
			if(p === 'op_message')
				newOperation.op_message += ': ' + opValues.op_message;
			else
				newOperation[p] = opValues[p];
		}
	}
		
	if(!databaseManager.commitTransaction())
	{
		databaseManager.rollbackTransaction();
		return null;
	}

	return newOperation;
}
/**
 * Generate a new record operation record to be used in long running method
 * @param {Number} idDitta
 * @param {Number} idGruppoInstallazione
 * @param {Number} periodo
 * @param {String} tipoOperazione
 * 
 * @return {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} 
 * 
 * @properties={typeid:24,uuid:"8C329F62-1D1C-41C1-A71F-ABA8BF99BE75"}
 */
function create(idDitta, idGruppoInstallazione, periodo, tipoOperazione)
{
    var params = {
    	userid                  : security.getUserName(), 
		clientid                : security.getClientID(),
		server                  : globals.server_db_name,
		idditta                 : idDitta,
		idgruppoinstallazione   : idGruppoInstallazione,
		periodo                 : periodo,
		optype                  : tipoOperazione
    };
    
    var url = globals.WS_OPERATION + '/Operation/Create';
    /** @type {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} */
    var response = globals.getWebServiceOperationResponse(url,params);
    if(response)
	    return response;
    return null;
}

/**
 * Delete the requested operation
 * 
 * @param {String} operationId
 * 
 * @return {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} 
 * 
 * @properties={typeid:24,uuid:"F07D57FE-6A5F-45EB-92BD-B29E0BE7A1E7"}
 */
function remove(operationId)
{
	var params = {
    	userid                  : security.getUserName(), 
		clientid                : security.getClientID(),
		server                  : globals.server_db_name,
		operationId             : operationId
    };
    
    var url = globals.WS_OPERATION + '/Operation/Delete';
    /**@type {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} */
    var response = globals.getWebServiceOperationResponse(url,params);
    return response;
}

/**
 * Updating an existing operation data
 * 
 * @param {String} operationId
 * @param {Number} status
 * @param {Number} progress
 * @param {String} [message]
 * @param {Date} [end]
 * @param {Date} [lastprogress]
 * 
 * @return {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} 
 * 
 * @properties={typeid:24,uuid:"1CC85C68-E4D6-4B38-AFBA-207571E45125"}
 */
function update(operationId, status, progress, message, end, lastprogress)
{
	var params = {
    	userid                  : security.getUserName(), 
		clientid                : security.getClientID(),
		server                  : globals.server_db_name,
		operationId             : operationId,
		status                  : status,
        progress                : progress,
        end                     : end,
        lastprogress            : lastprogress,
        message                 : message
    };
    
	var url = globals.WS_OPERATION + '/Operation/Update';
	/** @type {{statusCode : Number, returnValue: Object, message : String, operationId : String, operationHash : String, status : Number, start : Date, end : Date, progress : Number, lastProgress : Date}} */
    var response = globals.getWebServiceOperationResponse(url,params);
    return response;
}