/**
 * @properties={typeid:24,uuid:"B73E0269-6110-4C7B-82D3-0F64F9852E8A"}
 */
function showStoricoOperazioni()
{
	var frm = forms.mao_history_main;
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Storico operazioni');
}

/**
 * @param {Number} [periodo]
 * 
 * @properties={typeid:24,uuid:"B06421A2-52B0-48AB-8141-A68DC8347030"}
 */
function apriStoricoOperazioni(periodo)
{
	var frm = forms.mao_history_main;
    //  apertura form storico senza necessariamente aprire il program relativo (molto più snello)	
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Storico operazioni');
	
	// codice precedente
	// globals.openProgram('MA_StoricoOperazioni', null, true);
}

/**
 * @param {Number} [periodo]
 *
 * @properties={typeid:24,uuid:"2836E312-E001-4A6F-9876-888FD0C41683"}
 */
function apriStoricoOperazioniLite(periodo)
{
	var frm = forms.mao_history_main_lite;
    //  apertura form storico senza necessariamente aprire il program relativo (molto più snello)	
	globals.ma_utl_showFormInDialog(frm.controller.getName(), 'Avanzamento stato operazione');
	
	// codice precedente
	// globals.openProgram('MA_StoricoOperazioni', null, true);
}

/**
 * Create and returns a new operation
 * 
 * @param {String} 	 [opType] 		the code of the operation to launch
 * @param			 [opValues] 	an object specifying values for the operation's fields
 * 
 * @return {JSRecord<db:/ma_log/operationlog>} the operation, or <code>null</code> if it could not be started
 * 
 * @properties={typeid:24,uuid:"A20581EF-B00B-498C-B457-92B6B1B474F8"}
 */
function GetNewOperation(opType, opValues)
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