/**
 * @type {Object}
 * 
 * @properties={typeid:35,uuid:"107F090D-24D5-40CB-9D58-6044E2CF3668",variableType:-4}
 */
var jobsList = {};

/**
 * @properties={typeid:35,uuid:"C9715732-2EC1-4D36-A76F-853EB575384A",variableType:-4}
 */
var OpStatus = 
{
	 ONGOING:	  0,
	 SUCCESS:	  1, 
	 ERROR:		 -1, 
	 WARNING:	255
};

/**
 * Oggetto contente i codici delle operazioni disponibili (tabella MA_Log.OperationType)
 * 
 * @properties={typeid:35,uuid:"0A2CF936-B7CE-4326-B268-50140E35651E",variableType:-4}
 */
var OpType =
{
	CGC: 'CGC',
	SDR: 'SDR',
	SDA: 'SDA',
	SDS: 'SDS',
	SDP: 'SDP',
	SCA: 'SCA',
	SSF: 'SSF',
	SST: 'SST',
	SNL: 'SNL',
	SET: 'SET',
	EDR: 'EDR',
	EDA: 'EDA',
	EWEA:'EWEA',
	SRV: 'SRV',
	STCau: 'STCau',
	SRCau : 'SRCau',
	AmmAG : 'AmmAG',
	AmmMO : 'AmmMO',
	AmmCC : 'AmmCC',
	AmmIU : 'AmmIU',
	SRR : 'SRR',
	ITCom : 'ITCom' // importazione tracciato ore commesse
	
};

/**
 * Start a new job to execute a request to the provided url with the provider parameters
 * 
 * @param {String} url		the webservice url to send the request to
 * @param {Object} params	the parameters to set in the request's body
 * @param {Function} [checkStatusFunction] the callback function to call every time the checkStatus method gets executed
 * @param {Number} [checkStatusInterval] the interval, in milliseconds, at which to check the status of the operation. Defaults to 1000
 * @param {Function} [continueWithCallback] the callback function to call when the operation is done, either successfully
 * 						or with errors. It is passed the whole row
 *
 * @properties={typeid:24,uuid:"BE0671FC-C5CA-4F5C-8580-A622B5C861E8"}
 */
function addJsonWebServiceJob(url, params, checkStatusFunction, checkStatusInterval, continueWithCallback)
{
	if(!checkStatusFunction)
		checkStatusFunction = vUpdateOperationStatusFunction;
	
	if(!continueWithCallback)
		continueWithCallback = vOperationDoneFunction;
	
	callBackgroundJob
	(
		asyncJsonWebServiceRequest
		,[
			 url
			,params
			,true
			,checkStatusFunction
			,checkStatusInterval
			,continueWithCallback
		 ]
		,null
		,true
	);
	
}

/**
 * @param {String} url the url to send the request to
 * @param {Object} params the object to set as the request's body content
 * @param {Boolean} [startJob] whether to start a job to periodically check the status of the operation
 * @param {Function} [checkStatusFunction] the callback function to call every time the checkStatus method gets executed
 * @param {Number} [checkStatusInterval] the delay between status checks, in milliseconds. Defaults to 1000
 * @param {Function} [continueWithCallback] the callback function to execute when the operation is done,
 * 					 either successfully or with errors. It is passed the whole row
 * 
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"645700B0-75E9-4A46-BFD4-D9552AF55A9E"}
 * @SuppressWarnings(unused)
 */
function asyncJsonWebServiceRequest(url, params, startJob, checkStatusFunction, checkStatusInterval, continueWithCallback)
{
	var client = globals.getHttpClient();
	
	//aggiungiamo ai parametri il riferimento alla connessione al database cliente
	if(globals.isCliente())
	   params.databasecliente = globals.customer_db_name;
	
	params.tipoconnessione = params.tipoconnessione != null ? params.tipoconnessione : globals.getTipoConnessione();
	params.idgruppoinstallazione = (params['idditta'] == 999999) ? 1 :
		                           params.idgruppoinstallazione || globals.getGruppoInstallazioneDitta(params['idditta']) 
	
	// all'inizio di qualsiasi operazione lunga i pulsanti vengono impostati disabilitati 							   
    forms.mao_history_main_lite.elements.lbl_op_print_lite.enabled = false;
    forms.mao_history_main_lite.elements.lbl_op_confirm.enabled = false;
	
    var lastSlashIndex;
    switch(ENVIRONMENT_CASE)
	{
		case ENVIRONMENT.DEVELOPING :
			lastSlashIndex = utils.stringPosition(url,'/',1,4);
			break;
		default :
			lastSlashIndex = utils.stringPosition(url,'/',1,5);
			break;
	}
        
	/**
	 * Remove all leading underscores, if any
	 */
	var jsonParams = plugins.serialize.toJSON(params).replace(/_([a-zA-Z0-9]+)(\\?":)/g, '$1$2');
	
	var request = client.createPostRequest(url);
	switch(WS_DOTNET_CASE)
	{
		case WS_DOTNET.CORE:
		request.addHeader('Content-type','application/json');	
		break;
		default:
		request.addHeader('Content-type','text/json');
		break;
	}
	request.setBodyContent(jsonParams);
	
	var response = request.executeRequest();
	if (response != null)
	{
		var msg = '';
		var jsonResponse = response.getResponseBody();
		var responseObj = plugins.serialize.fromJSON(jsonResponse);
		
		switch (response.getStatusCode())
		{
			case globals.HTTPStatusCode.UNAUTHORIZED:
			case globals.HTTPStatusCode.FORBIDDEN:
				msg = 'L\'utente non dispone delle autorizzazioni necessarie';
				break;
		
			case globals.HTTPStatusCode.REQUEST_TIMEOUT:
				msg = 'Errore di timeout durante l\'accesso alla risorsa' + url;
			    break;
				
			// Conflict
			case globals.HTTPStatusCode.CONFLICT:
				var message = responseObj['message'] || 'È in corso un\'altra operazione sui dipendenti selezionati';
			
				/** @type {JSFoundSet<db:/ma_anagrafiche/lavoratori>} */
				var employeesFoundset = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE,globals.Table.LAVORATORI);
				if (employeesFoundset.find())
				{
					employeesFoundset.idlavoratore = responseObj['blocked'];
					if(employeesFoundset.search() > 0)
					{
						message += '<p>';
						for(var emp = 1; emp <= employeesFoundset.getSize(); emp++)
							message += employeesFoundset.getRecord(emp).lavoratori_to_persone.nominativo + '<br/>';

						message += '</p>';
					}
				}
				
				message += 'Vuole eliminare il blocco sulle operazioni relative al suo utente?';
				
				var unblock = globals.ma_utl_showYesNoQuestion(message,'i18n:svy.fr.lbl.excuse_me');
				if (unblock)
				{
					//gestione sblocco dipendenti
					/** @type {JSFoundSet<db:/ma_log/operationemployee>} */
					var opEmployeesFs = databaseManager.getFoundSet(globals.Server.MA_LOG,'OperationEmployee');
					if (opEmployeesFs.find())
					{
						opEmployeesFs.dip_id = responseObj['blocked'];
						if(opEmployeesFs.search() > 0)
						{
							databaseManager.startTransaction();
							
							if(opEmployeesFs.deleteAllRecords())
							{
							   if(!databaseManager.commitTransaction())
							   {
								   databaseManager.rollbackTransaction();
								   globals.ma_utl_showWarningDialog('Rimozione blocchi non riuscita, riprovare o contattare lo studio',
                                                              'Rimozione blocchi');
							   }
							   else
							   	   //avvisa dell'avvenuta cancellazione
							       globals.ma_utl_showInfoDialog('Il blocco è stato rimosso, riprovare ad effettuare l\'operazione desiderata',
								                           'Rimozione blocchi');
							}
							else 
								globals.ma_utl_showWarningDialog('Rimozione blocchi non riuscita, riprovare o contattare lo studio',
                                                           'Rimozione blocchi');
						}
						else 
							globals.ma_utl_showInfoDialog('Nessun blocco trovato, riprovare','Rimozione blocchi');
					}
					else 
						globals.ma_utl_showErrorDialog('Cannot go to find mode','Find...');
				}
				
				break;
	
			case globals.HTTPStatusCode.INTERNAL_ERROR:
				msg = url + ' : Errore di elaborazione, rieffettuare l\'operazione o contattare il servizio di assistenza.';
			    break
	
			case globals.HTTPStatusCode.NOT_IMPLEMENTED:
				msg = url + ' : Il servizio richiesto non è disponibile, contattare l\'assistenza';
				break
				
			case globals.HTTPStatusCode.OK:
				if (responseObj['returnValue'] == true)
				{	
					if(startJob)
					{
						var op_id = responseObj['op_id'] || responseObj['operationId'];
						
						globals.callBackgroundJob
						(
							 checkStatus
							,[op_id, checkStatusFunction, checkStatusInterval, continueWithCallback]
							,null
							,true
							,500
						);
					}
			        
					var answer = true;
					if (answer)
					{
						var paramsObj = null;
						if(globals.nav_program_name)
						   paramsObj = globals.objGiornParams[forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab]];
						var periodo = 0;
						var gruppo_installazione = 0;
						var gruppo_lavoratori = '';
							
					    if (paramsObj) 
					    {
						    if (paramsObj.periodo)
							    periodo = paramsObj.periodo;
						    if (paramsObj.gruppo_inst)
							    gruppo_installazione = paramsObj.gruppo_inst
						    if (paramsObj.gruppo_lav)
							    gruppo_lavoratori = paramsObj.gruppo_lav
					    }
						else if (params.periodo)
							    periodo = params.periodo
																			
						var employeeID = params.iddipendenti && params.iddipendenti.length === 1 ? params.iddipendenti[0] : 0;
						
						var operationProgramFs = databaseManager.getFoundSet(globals.MA_LOG, 'operationprogram');
						var opParams = inizializzaParametriOperations(
																	  // è stato necessario introdurre il nome Stampe altrimenti lo storico operazioni
																	  // non veniva aperto a meno che fosse già aperta una scheda
																	  globals.nav_program_name ? globals.nav_program_name : 'Stampe',
								                                      op_id,
																	  periodo,
																	  gruppo_installazione,
																	  gruppo_lavoratori,
																	  employeeID);
						globals.saveObject(opParams,operationProgramFs);
						
						// nuovo storico
						scopes.log.apriStoricoOperazioniLite();
						
						// OLD storico
//						scopes.log.apriStoricoOperazioni();
//						forms.mao_history_main.filterOperations();
					}
				}
				else
				{
					application.output('Il web service non è riuscito  prendere in carico la richiesta a causa di : ' + responseObj['message'], LOGGINGLEVEL.ERROR)
				    globals.ma_utl_showErrorDialog('Il server non è riuscito a prendere in carico la richiesta, riprovare ', 'i18n:svy.fr.lbl.excuse_me');
				}
				break;
			
			default:
			    msg = 'Il server non è riuscito a prendere in carico la richiesta. \nEffettuare nuovamente il login e, se il problema persiste, contattare il servizio di assistenza.';
			    security.logout(application.getSolutionName());
				break;			
		}
		
		if(msg != '')
		{
			globals.ma_utl_showErrorDialog(msg, 'i18n:svy.fr.lbl.excuse_me');
		    application.output(msg, LOGGINGLEVEL.ERROR);
		}
	}
	else
	{
		globals.ma_utl_showErrorDialog('<html>Il server non risponde alla richiesta.<br/>Controllare l\'accesso ad internet, effettuare nuovamente il login e, se il problema persiste, contattare il servizio di assistenza.</html>', 'i18n:svy.fr.lbl.excuse_me');
		security.logout(application.getSolutionName());
	}
	
	return responseObj;
}


/**
 * Periodically check the status of the given operation. By default, every one second.
 * Timeouts after 60 seconds if no progress has occured.
 * When the operation finishes, it removes the job which started it.
 * 
 * @param {String} operationId the operation's id, as returned by the web service
 * @param {Function} [callback] the function to call when the method has executed
 * @param {Number} [delay] the delay between requests, in milliseconds
 * @param {Function} [continueWithCallback] the callback function to call when the
 * 						operation is done, wither succesfully or with error. It is
 * 						passed the whole row
 * 
 * @return {{ status: { op_id: String, op_hash: String, op_start: Date, op_end: Date, op_status: Number, op_progress: Number, op_message: String }, timeout: Boolean }}
 * 
 * @properties={typeid:24,uuid:"28EFCE8A-93B3-4E08-9755-FF64554F3742"}
 */
function checkStatus(operationId, callback, delay, continueWithCallback)
{	
	try
	{
		delay = delay || 1000;
		
		var retObj = null;
		var currentTimeStamp = new Date();
		var checkStatusJobName = 'checkStatusJob_' + operationId;
	
		// First execution
		if(!jobsList[operationId])
			jobsList[operationId] = { lastProgress: 0.00000, lastProgressTimeStamp: currentTimeStamp.getTime() };
		
		/** @type {{ lastProgress: Number, lastProgressTimeStamp: Number, lastMessage: String }} */
		var job = jobsList[operationId];
		var timeout = DEFAULT_TIMEOUT;
		var hasProgress    = false;
		var timeoutReached = false;
		var startDate = currentTimeStamp;
			startDate.setMilliseconds(startDate.getMilliseconds() + delay);
		
		var operation = getOperationStatus(operationId);		
		if (operation && operation.op_status === OpStatus.ONGOING)
		{
			var lastProgress = operation.op_lastprogress;
			var lastmessage = operation.op_message;
			
			hasProgress = lastProgress && lastProgress.getTime() > job.lastProgressTimeStamp;
			
			if (!hasProgress)
			{
				// If there isn't a progress, check if message changed
				hasProgress = (job.lastMessage && lastmessage != job.lastMessage); 
			}
			
			timeoutReached = currentTimeStamp.getTime() - job.lastProgressTimeStamp >= timeout + delay;
			
			// Operation has never change its progress and timeout has reached
			if(!hasProgress && timeoutReached)
			{
				// Reset the variables
				delete jobsList[operationId];
				// Remove the check status job
				plugins.scheduler.removeJob(checkStatusJobName);			
			}
			else
			{
				// Timeout is reached in the middle of operation's progress
				if(timeoutReached)
				{
					// Remove the check status job
					plugins.scheduler.removeJob(checkStatusJobName);
					
					// Call the finish callback for the timeout happening
					retObj = { status: operation, timeout: timeoutReached, hasProgress: (hasProgress = true) };
					if(continueWithCallback)
						continueWithCallback.apply(null, [retObj]);
				}
				else
				{
					// Progress occurred. Update the variables accordingly
					if(hasProgress)
					{
						job.lastProgressTimeStamp = currentTimeStamp.getTime();
						job.lastProgress = operation.op_progress;
					}
					
					// Start a new checkStatus job
					plugins.scheduler.removeJob(checkStatusJobName);
					plugins.scheduler.addJob(checkStatusJobName, startDate, checkStatus, 0, 0, null, [operationId, callback, delay, continueWithCallback]);
				}
			}
		}
		// Operation ended, either successfully or with error
		else if(operation)
		{
			// Reset the variables
			delete jobsList[operationId];
			
			// Remove the check status job
			plugins.scheduler.removeJob(checkStatusJobName);
			
			// Call the finish callback
			retObj = { status: operation, timeout: timeoutReached, hasProgress: (hasProgress = true) };
			if(continueWithCallback)
				continueWithCallback.apply(null, [retObj]);
						
		}
		
		retObj = { status: operation, timeout: timeoutReached, hasProgress: hasProgress };
		
		// control added to understand why sometimes polling job on long operation stop working
		if(!forms || !forms.mao_history_lite || !forms.mao_history_main_lite)
		{
			var msgError = 'Non è possibile seguire direttamente il progresso dell\'operazione a causa del verificarsi di un errore nella connessione con il server. \n';
		    msgError += 'L\'operazione proseguirà comunque in background. Per visualizzarne lo stato, si consiglia id rieffettuare il login all\'applicazione ed aprire lo <b>Storico operazioni</b>';
		
			application.output(msgError,LOGGINGLEVEL.ERROR);   
			    
		    globals.ma_utl_showErrorDialog(msgError);
		}
		
		if(callback)
		   callback(retObj);
			
		return retObj;
	}
	catch(ex)
	{
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		plugins.scheduler.removeJob(checkStatusJobName);
		return null;
	}
}

/**
 * Get the current status of an operation
 * 
 * @param {String} operationId
 * 
 * @return {{ op_id: String, op_hash: String, op_start: Date, op_end: Date, op_status: Number, op_progress: Number, op_message: String, op_lastprogress: Date }}
 * 
 * @private
 *
 * @properties={typeid:24,uuid:"EA230C57-7249-4F15-9F3E-F801CBAE4635"}
 */
function getOperationStatus(operationId) {
	
	var url = WS_OP_URL + "/Operations/GetStatus/" + operationId;
		
	var client = globals.getHttpClient();
	var request = client.createGetRequest(url);
	
	var response = request.executeRequest();
	if (response)
	{
	    var jsonResponse = response.getResponseBody();
	    /** @type {{ op_id: String, op_hash: String, op_start: Date, op_end: Date, op_status: Number, op_progress: Number, op_message: String, op_lastprogress: Date }} */
		var responseObj = plugins.serialize.fromJSON(jsonResponse);
			responseObj.op_start 		= globals.dateFormat(responseObj.op_start, globals.LOG_DATEFORMAT);
			responseObj.op_lastprogress = globals.dateFormat(responseObj.op_lastprogress, globals.LOG_DATEFORMAT);

		return responseObj;
	}
	
	return null;
}

/**
 * @param {String} userID
 * @param {Number} idditta
 * @param {Number} iddipendente
 * @param {Number} [periodo]
 * 
 * @return {{returnValue: Boolean, status: Number, message: String, op_id: String, client_id: String}} true if there are concurrent operations, false otherwise.
 * 			If false is returned, status = 0 means user's operations, status = 1 means other users' operations
 * 
 * @properties={typeid:24,uuid:"56BC1091-3E3A-4077-A165-24F186C820F6"}
 */
function askForConcurrentOperations(userID, idditta, iddipendente, periodo)
{
	var hClient = globals.getHttpClient();
	
	var request = hClient.createPostRequest(WS_URL + '/Operations/CheckForConcurrentOperations');
		request.addParameter('userID',userID.toString());
		if(idditta)
		   request.addParameter('idditta',idditta.toString());
		if(iddipendente)
		   request.addParameter('iddipendente',iddipendente.toString());
		if(periodo)
		   request.addParameter('periodo',periodo.toString());
		
	var response = request.executeRequest();
	if(response)
	{
		/** @type {{returnValue: Boolean, status: Number, message: String, op_id: String, client_id: String}} */
		var responseObj = plugins.serialize.fromJSON(response.getResponseBody());
		return responseObj;
	}
	else
	{
		throw new Error('La richiesta non è stata eseguita');
	}
}

/**
 * @properties={typeid:24,uuid:"ED17B956-9E0E-403D-8FCA-FEBD29576725"}
 */
function stampaAllegati(retObj)
{
	if(retObj.status.op_status === OpStatus.SUCCESS)
	{
		printFiles(retObj.status.op_id);
	}
}

/**
 * @properties={typeid:24,uuid:"4FAA57C2-1B89-47AF-B9E6-27E7245AE74D"}
 */
function printFiles(fileFs)
{
	// Open a new dialog with the list of file for the operation
	var form = forms.mao_prints.controller.getName();
	globals.ma_utl_showFormInDialog(form, 'Scarica stampe', fileFs);
}

/**
 * @properties={typeid:24,uuid:"407978ED-126E-4AFA-8094-DAC8DF8B6FA3"}
 */
function printFile(file)
{
	plugins.file.writeFile(file.file_name, file.file_bytes, file.file_type);
}

/**
 * @properties={typeid:24,uuid:"E68E9718-4D1D-4A63-B7A6-8A37FD2FE4BD"}
 */
function isBusy(program, op_id) 
{
	if(forms.svy_nav_fr_openTabs.vSelectedTab != null
	&& 	forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab])
	{
	   var progObj = globals.objGiornParams[forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab]];
	   if(progObj)
		  return progObj['op_id'] === op_id;
	}
	return false;
}

/**
 * @param {String} program
 * @param {Boolean} busy
 * @param {String} [op_id]
 *
 * @properties={typeid:24,uuid:"C874C5F2-232C-4B2E-B634-FDDD9178B278"}
 */
function setBusy(program, busy, op_id)
{
	if (program) 
	{
		if(forms.svy_nav_fr_openTabs.vSelectedTab != null
			&& 	forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab])
    	globals.objGiornParams[forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab]]['op_id'] = busy ? op_id : null;
	}
}

/**
 * @param {Function} method
 * @param {Array} [methodArgs]
 * @param {Function} [callback]
 * @param {Boolean} [async]
 * @param {Number} [delay]
 *
 * @properties={typeid:24,uuid:"E3BF3A20-E198-4876-8DBE-57A0EC44C4EF"}
 */
function callBackgroundJob(method, methodArgs, callback, async, delay)
{
	var jobName = 'job_' + application.getUUID();
	
	/**
	 * Add the requested delay
	 */
	var startDate = new Date();
	if(delay)
		startDate.setMilliseconds(startDate.getMilliseconds() + delay);
	
	if(application.getApplicationType() == APPLICATION_TYPES.WEB_CLIENT && !async)
	{
		var jobContinuation = new Continuation();
	
		// Start the job
		plugins.scheduler.addJob(jobName, startDate, startJobCallback, 0, 0, null, [method, { methodArgs: methodArgs }, jobName, jobContinuation]);
		new Continuation();
	}
	else
	{
		plugins.scheduler.addJob(jobName, startDate, startJobCallback, 0, 0, null, [method, { methodArgs: methodArgs }, jobName, null, callback]);
	}
}

/**
 * @param {Function} method
 * @param {{ methodArgs: Array }} args
 * @param {String} jobName
 * @param {Continuation} continuation
 * @param {Function} callback
 *
 * @properties={typeid:24,uuid:"9F7BB012-3003-486F-A19B-411FCA53C90E"}
 */
function startJobCallback(method, args, jobName, continuation, callback)
{
	// Remove the job since it got executed
	plugins.scheduler.removeJob(jobName);
	
	if(args && args.methodArgs && !(args.methodArgs instanceof Array))
		return;
	
	var retValue = method.apply(null, args.methodArgs);
	
	if(continuation)
		continuation(retValue);
	else if(callback)
		callback(retValue);
}

/**
 * Starts a new operation in async mode. Returns the id of the newly started operation, if successful.
 * The optional callback argument gets executed at the end of the operation, and is passed the method's
 * return value as the only argument
 * 
 * @param {Function} method 		the method to call
 * @param {Array} 	 [methodArgs] 	the arguments to pass to the method
 * @param {Function} [callback] 	the callback function to execute when done
 * @param {Number} 	 [delay] 		the delay in ms before calling the method
 * @param {String} 	 [opType] 		the code of the operation to launch
 * @param			 [opValues] 	an object specifying values for the operation's fields
 * 
 * @return {JSRecord<db:/ma_log/operationlog>} the operation, or <code>null</code> if it could not be started
 * 
 * @properties={typeid:24,uuid:"14427909-0F72-47D5-8678-BD427AE05043"}
 */
function startAsyncOperation(method, methodArgs, callback, delay, opType, opValues)
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
		
	databaseManager.commitTransaction();
	
	scopes.log.apriStoricoOperazioniLite();
	
//	scopes.log.apriStoricoOperazioni();
//	forms.mao_history_main.filterOperations();
	
	// 2000 sembra abbastanza per permettere l'apertura dello storico operazioni...
//	callBackgroundJob(method, (methodArgs || []).concat([newOperation]), callback, true, delay || 2000);
	callBackgroundJob(method, (methodArgs || []).concat([newOperation]), callback, true, delay);
	
	return newOperation;
}

/**
 * Starts a new operation in async mode. Returns the id of the newly started operation, if successful.
 * The optional callback argument gets executed at the end of the operation, and is passed the method's
 * return value as the only argument
 * 
 * @param {String} solutionName
 * @param {String} methodName
 * @param {String} context
 * @param {Array} [methodArgs] the arguments to pass to the method
 * @param {Function} [callback] the callback function to execute when done
 * @param {String} [opType] the code of the operation to launch
 * @param {String} [user]
 * @param {String} [password]
 * 
 * @return {JSRecord<db:/ma_log/operationlog>} the operation, or <code>null</code> if it could not be started
 * 
 * @properties={typeid:24,uuid:"A6E6C50E-E00C-4167-8AD9-D8FD881A30BE"}
 */
function startAsyncBackgroundOperation(solutionName, context, methodName, methodArgs, opType, callback, user, password)
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
		
	databaseManager.commitTransaction();

	/**
	 * Launch the actual operation
	 */
	var client = globals.getHeadlessClientInstance(solutionName, user, password);
		client.queueMethod(context, methodName, (methodArgs || []).concat([newOperation.op_id]), callback || asyncOperationDone)
		
	/**
	 * Start a check status job
	 */
	globals.callBackgroundJob(globals.checkStatus, [newOperation.op_id], null, true);
	
	/**
	 * Open history tab
	 */
	scopes.log.apriStoricoOperazioniLite();
//	globals.openProgram('MA_StoricoOperazioni');
	
	return newOperation;
}

/**
 * @param {JSEvent} event
 * @param {plugins.headlessclient.JSClient} client
 *
 * @properties={typeid:24,uuid:"37BE350E-C83B-4ABB-887E-54FE548FA4B3"}
 */
function asyncOperationDone(event, client)
{
	application.output('done', LOGGINGLEVEL.INFO);
//	if(client && client.isValid())
//	{
//		if(event === JSClient.CALLBACK_EXCEPTION_EVENT)
//			throw event.data;			
//	}
}

/**
 * Saves a file into the log db
 * 
 * @param {JSRecord<db:/ma_log/operationlog>} operation the id of the operation the file is to be associated to
 * @param {Array<byte>} bytes
 * @param {String} fileName
 * @param {String} [mimeType] Defaults to 'binary/octet-stream'
 * @param {Date} [uploadDate] Defaults to new Date()
 * 
 * @return {Boolean} true if successfull, false otherwise
 *
 * @properties={typeid:24,uuid:"ABFB5F20-ED31-4D3C-8B70-0BA03856197F"}
 * @AllowToRunInFind
 */
function saveFile(operation, bytes, fileName, mimeType, uploadDate)
{
	/** @type {JSFoundSet<db:/ma_log/filelog>} */
	var fileFs = databaseManager.getFoundSet(globals.Server.MA_LOG, globals.Table.FILE_LOG);
	if(!fileFs)
		return false;
	
	var newFile = fileFs.getRecord(fileFs.newRecord());
	if(!newFile)
		return false;
	
	newFile.file_bytes = bytes;
	newFile.file_name = fileName;
	newFile.file_type = mimeType || globals.MimeTypes.GENERIC;
		
	var operationFile = operation.operationlog_to_operationfile.getRecord(operation.operationlog_to_operationfile.newRecord());
	if(!operationFile)
		return false;
	
	operationFile.file_id = newFile.file_id;
		
	return true;
}

/**
 * @properties={typeid:24,uuid:"39969F69-7BCF-4A22-80FE-DCC0D5E44231"}
 */
function getOperationStatusLabel(status)
{
	return application.getValueListDisplayValue('vls_stato_operazione', status);
}

/**
 * Callback method for when solution is opened.
 *
 * @properties={typeid:24,uuid:"A590C7DF-0209-4D64-B793-BD346916B9C5"}
 */
function ma_operations_onSolutionOpen()
{
//	vUpdateOperationStatusFunction = globals.checkStatusCallback;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"DF7245C2-185A-4794-B91C-2B2EDF47AD22"}
 * @AllowToRunInFind
 */
function onActionBtnPrint(event)
{
	var operationFile = operationuser_to_operationlog && operationuser_to_operationlog.operationlog_to_operationfile;
	if (operationFile && operationFile.find()) {
		operationFile.is_print = 1;
		if (operationFile.search() > 0)
		{ 
			if (operationFile && operationFile.getSize() > 0) {
				if (operationFile.getSize() > 1) {
					globals.printFiles(operationFile);
				} else {
					var file = operationFile.operationfile_to_filelog.getSelectedRecord();
					plugins.file.writeFile(file.file_name, file.file_bytes, file.file_type);
				}
			}
			
	    } else {
		     globals.ma_utl_showInfoDialog('Nessuna stampa per l\'operazione selezionata.<br/>N.B. Nel caso l\'operazione sia stata completata con successo, attendere qualche secondo per la generazione del file.', 'i18n:svy.fr.lbl.excuse_me');
	    }
	}
}

/**
 *
 * @properties={typeid:24,uuid:"E70C9AC4-9D10-433F-A35B-2FD7C4C8B2B0"}
 */
function inizializzaParametriOperations(program_id,op_id,periodo,gruppo_installazione,gruppo_lavoratori,employee_id)
{
	return {
		user_id                 : security.getUserName(), 
		client_id               : security.getClientID(),
		program_id              : program_id,
		op_id                   : op_id,
		periodo                 : periodo,
		gruppo_installazione    : gruppo_installazione,
		gruppo_lavoratori       : gruppo_lavoratori,
		employee_id             : employee_id
	};
}
