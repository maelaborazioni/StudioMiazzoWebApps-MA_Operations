/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"EE09F1BF-9A54-4DB1-B657-BE051DA63CF6"}
 */
var vGiornalieraIcon = 'media:///row_preferences_16.png';

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"C4422FC2-F192-4B65-8A5B-9BEBB1D4A339"}
 * @AllowToRunInFind
 */
function onShowForm(firstShow, event)
{
	_super.onShowForm(firstShow, event);	
	
//	if(foundset.find())
//	{
//		foundset.user_id = i18n.getI18NMessage('svy.fr.lbl.username');
//		foundset.search();
//	}
	foundset.sort('operationuser_to_operationlog.op_start desc');
	
	// Update the foundset
	databaseManager.refreshRecordFromDatabase(foundset, -1);
}

/**
 * @param {String} [operationId]
 * @properties={typeid:24,uuid:"69604180-9B72-470C-BE98-A35869939A75"}
 * @AllowToRunInFind
 */
function updateOperationStatus(operationId)
{	
	//Find the form's foundset's record with this operation's id
	var copyFoundset = foundset.duplicateFoundSet();
	if(copyFoundset.find())
	{
		copyFoundset.op_id = operationId;
		if(copyFoundset.search() > 0)
		{
			// Update the related foundset
			var fs = copyFoundset.operationuser_to_operationlog;
			if(fs)
				databaseManager.refreshRecordFromDatabase(fs, 0);
		}
	}
}

/**
 * @properties={typeid:24,uuid:"D1B6F545-9790-45E3-B972-64FE1A6C2D35"}
 * @AllowToRunInFind
 */
function checkStatusCallback(retObj)
{
	if(retObj.timeout && retObj.timeout === true)
	{
		var fs = foundset.duplicateFoundSet();
		if(fs.find())
		{
			fs.op_id = retObj.status.op_id;
			if(fs.search() > 0)
			{
				// We don't want to update the database, only the row shown onscreen
				databaseManager.setAutoSave(false);
				fs.operationuser_to_operationlog.op_message = i18n.getI18NMessage('i18n:ma.msg.timeout');
			}
		}
	}
	else
	{
		if(retObj.status)
			updateOperationStatus(retObj.status.op_id);
	}
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"C1561D4D-85F0-435F-90C8-4A25C1F91484"}
 */
function onRenderStatus(event) {
	/** @type {JSRecord<db:/ma_log/operationuser>} */
	var rec = event.getRecord();
	if( rec && rec.operationuser_to_operationlog.op_status == globals.OpStatus.ONGOING)
		event.getRenderable().bgcolor = '#FFCC00';
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"46CE300B-01D0-4A6C-90C7-35972C443442"}
 */
function onActionBtnUpdate(event) {
	// Start a new check status job if not already present
	var jobName = 'checkStatusJob_' + op_id;
	if(!globals.contains(plugins.scheduler.getCurrentJobNames(), jobName))
		plugins.scheduler.addJob(jobName, application.getTimeStamp(), globals.checkStatus, 0, 0,  null, [op_id, checkStatusCallback, null, globals.vOperationDoneFunction]);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"764698DE-F047-4897-A89D-3381B6FF2C5B"}
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
			
	    } else 
		     globals.ma_utl_showInfoDialog('Nessuna stampa per l\'operazione selezionata.<br/>N.B. Nel caso l\'operazione sia stata completata con successo, attendere qualche secondo per la generazione del file.', 'i18n:svy.fr.lbl.excuse_me');
	    
	}
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D8DFE574-3AAC-4C69-9EAC-53F69B25C25F"}
 */
function onRenderStampe(event) {
	
	var recCol = event.getRecord();
	if(event.isRecordSelected())
		event.getRenderable().bgcolor = '#D0373F'
        	
	var operationFile = recCol['operationuser_to_operationlog.operationlog_to_operationfile'];
	if (operationFile && operationFile['is_print'] == 1) {
		
		event.getRenderable().enabled = true;
		
	}else
	    event.getRenderable().enabled = false;
}