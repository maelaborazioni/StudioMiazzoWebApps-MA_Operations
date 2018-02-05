/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F1A1D480-702F-487F-BAB4-14BF30CFEC2B"}
 */
var vStampaIcon = 'media:///hr_q_printer_40.png';

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"22DF0F6B-FA22-4ECA-9CD5-CA85E0EEC865"}
 * @AllowToRunInFind
 */
function onShowForm(firstShow, event)
{
	_super.onShowForm(firstShow, event);	
		
	if(foundset.find())
	{
		foundset.operationuser_to_operationlog.hidden = 0;
		foundset.search();
	}
		       	
	foundset.sort('operationuser_to_operationlog.op_start desc');
	
	// Update the foundset
	databaseManager.refreshRecordFromDatabase(foundset, -1);
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"679A15DF-1DD1-4E83-9CAA-F2FA73338701"}
 */
function onRenderOperation(event) {
	
	/** @type {JSRecord<db:/ma_log/operationlog>} */
	var recInd = event.getRecordIndex();
	var recRen = event.getRenderable();
	var recCol = event.getRecord()
	
	if (recCol != null) {
		
		if (recCol['operationuser_to_operationlog.operationlog_to_operationfile']['is_print']) {
			
			recRen.enabled = true;
			
			if (event.isRecordSelected())
			{
				recRen.bgcolor = '#EC1C24';
				recRen.fgcolor = '#F0F0F0';
			}
			
		} else {
			
			if (event.isRecordSelected())
			{	
				recRen.bgcolor = '#EC1C24';
				recRen.fgcolor = '#F0F0F0';
			}
			else {
				if ( (recInd % 2) == 0)
					recRen.bgcolor = '#E8E8E8';
				else
					recRen.bgcolor = '#FFFFFF';
			}
		}

	}
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"22FC71EE-3948-48C0-AC9E-7993078E59DC"}
 */
function onRenderStampe(event) {
	
	var recCol = event.getRecord();
	var recRen = event.getRenderable();   
	
	var operationFile = recCol['operationuser_to_operationlog.operationlog_to_operationfile'];
	if (operationFile && operationFile['is_print'] == 1) {
		
		recRen.enabled = true;
//		event.getRenderable().visible = true;
		
	}
//	else
//	    event.getRenderable().enabled = false;
//	    event.getRenderable().visible = false;

//	if(event.isRecordSelected())
//	   recRen.bgcolor = '#D0373F'
	
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DDD3640D-7AA2-4704-9E45-CD0FA01B903A"}
 */
function onActionBtnNascondi(event) {
	
	databaseManager.startTransaction();
	foundset.operationuser_to_operationlog.hidden = 1;
	databaseManager.commitTransaction();
	forms.mao_history_main.filterOperations();

}

/**
 * Apri menu contestuale delle operazioni
 * 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"508703CB-2FEB-4F97-89C8-A067B116F61C"}
 */
function apriPopUpOperations(event)
{
	var source = event.getSource();
	var popUpMenu = plugins.window.createPopupMenu();
	
	var aggiorna = popUpMenu.addMenuItem('Aggiorna stato', aggiornaStatoOperazione);
	    aggiorna.methodArguments = [event];
	
	popUpMenu.addSeparator();
	    
	var download = popUpMenu.addMenuItem('Scarica documenti',scaricaDocumentiDaMenu);
	    download.methodArguments = [event];
	    
	popUpMenu.addSeparator();
	
	var nascondi = popUpMenu.addMenuItem('Nascondi operazione',nascondiOperazione);
	    nascondi.methodArguments = [event];
	var nascondiTutte = popUpMenu.addMenuItem('Nascondi tutte le operazioni',nascondiTutto);
	    nascondiTutte.methodArguments = [];
	    nascondiTutte.enabled = false;
	var recupera = popUpMenu.addMenuItem('Recupera tutte le operazioni',recuperaTutto);
	    recupera.methodArguments = [];
	    recupera.enabled = false;
//	var elimina = popUpMenu.addMenuItem('Elimina l\'operazione',eliminaOperazione);
//	    elimina.methodArguments = [];
	    
	popUpMenu.addSeparator();
	
	var info = popUpMenu.addMenuItem('Mostra identificativo dell\'operazione',mostraIdentificativo);
	    info.methodArguments = [];
	if(source != null)    
       popUpMenu.show(source);    
	    
}

/**
 * 
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"32A046FC-02EE-4ECB-9585-840754CAE0BD"}
 */
function aggiornaStatoOperazione(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event){

	// Start a new check status job if not already present
	var jobName = 'checkStatusJob_' + op_id;
	if(!globals.contains(plugins.scheduler.getCurrentJobNames(), jobName))
		plugins.scheduler.addJob(jobName, application.getTimeStamp(), globals.checkStatus, 0, 0,  null, [op_id, checkStatusCallback, null, globals.vOperationDoneFunction]);
}

/**
 * @param {String} [operationId]
 * @properties={typeid:24,uuid:"3914EEF8-4DBA-437E-ADB8-2839FAA734E0"}
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
			if (fs)
			{
				databaseManager.refreshRecordFromDatabase(fs, 0);
				return fs;
			}
		}
	}
	
	return null;
}

/**
 * @properties={typeid:24,uuid:"8E037FBC-B986-43EA-8386-B93D429F582E"}
 * @AllowToRunInFind
 */
function checkStatusCallback(retObj)
{
	if(!forms)
	{
		var msgError = 'Non è possibile verificare il progresso dell\'operazione a causa del verificarsi di un errore nella connessione con il server. \n';
		    msgError += 'L\'operazione proseguirà comunque in background. Per visualizzarne lo stato, rieffettuare il login all\'applicazione ed aprire lo <b>Storico operazioni</b>';
		globals.ma_utl_showErrorDialog(msgError);
		return;
	}
	
	var lblOpProgress = forms.mao_history_lite.elements.lbl_prog_fg;
	var lblOpMsg = forms.mao_history_main_lite.elements.lbl_history_msg;
	
	if(retObj.timeout)
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
				lblOpMsg.visible = true;
			}
		}
	}
	else
	{
		if(retObj.status && retObj.hasProgress)
			updateOperationStatus(retObj.status.op_id);
				
		switch(retObj.status.op_status)
		{
			case 0:
				// running : l'operazione è ancora in corso
			    lblOpProgress.setSize(Math.ceil(retObj.status.op_progress) * 4,20);
				lblOpProgress.bgcolor = globals.Colors.ATTENDANT.background;
				break;
			case 1:
				// success : l'operazione è terminata correttamente
                lblOpProgress.setSize(Math.ceil(retObj.status.op_progress) * 4,20);
                lblOpProgress.bgcolor = globals.Colors.ATTENDANT.background;
                break;
			case 255:
				// warning : l'operazione è terminata ma c'è una notifica 
			    lblOpProgress.setSize(Math.ceil(retObj.status.op_progress) * 4,20);
			    lblOpProgress.bgcolor = globals.Colors.WARNING.background;
			    break;
			case -1:
				// errore : l'operazione ha generato un errore 
			    lblOpProgress.setSize(Math.ceil(retObj.status.op_progress) * 4,20);
			    lblOpProgress.bgcolor = globals.Colors.SELECTED.background;
			    lblOpMsg.visible = true;
			    break;
		
		}
	}
}

/** 
 * @properties={typeid:24,uuid:"A7816B7D-A77B-4B4C-A9DD-37535607C247"}
 */
function operationDone(retObj)
{
	// Update the file foundset, to avoid stale data
	var fs = updateOperationStatus(retObj.status.op_id);
	if (fs)
	{
		databaseManager.refreshRecordFromDatabase(fs.operationlog_to_operationfile, 0);
		if(fs.operationlog_to_operationfile 
		   && fs.operationlog_to_operationfile.getSize())
		   forms.mao_history_main_lite.elements.lbl_op_print_lite.enabled = true;
		else
		{
			if(fs.operationlog_to_operationtype.codice == globals.Operations.RICEVI_TABELLE_GENERALI
			   || fs.operationlog_to_operationtype.codice == globals.Operations.RICEVI_TABELLE_DITTA
			   || fs.operationlog_to_operationtype.codice == globals.Operations.CHIUSURA_MESE)
			{
				var event = new JSEvent();
				event.data = {formname : forms.mao_history_main_lite.controller.getName()};
				forms.mao_history_main_lite.onHide(event);
				
				scopes.log.apriStoricoOperazioniLite();
			}
			
		}
			
		forms.mao_history_main_lite.elements.lbl_op_confirm.enabled = true;
	}
	else
		forms.mao_history_main_lite.elements.lbl_history_msg.visible = true;
	
}

/**
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"07DA8054-D3D1-46E2-89F8-E45274C6F28A"}
 * @AllowToRunInFind
 */
function scaricaDocumentiDaMenu(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event)
{
	scaricaDocumenti(_event);
}

/**
 * @AllowToRunInFind
 * 
 * Scarica i documenti, se presenti, relativi all'operazione selezionata
 * 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"00D926B0-3300-4DC9-B1A2-58743A32BECF"}
 */
function scaricaDocumenti(event)
{
	var operationFile = operationuser_to_operationlog && operationuser_to_operationlog.operationlog_to_operationfile;
	if (operationFile && operationFile.find())
	{
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
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"58025A0D-1C9D-4FFD-B73E-9E248362BEBA"}
 */
function nascondiOperazione(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event)
{
	databaseManager.startTransaction();
	foundset.operationuser_to_operationlog.hidden = 1;
	databaseManager.commitTransaction();
	forms.mao_history_main.filterOperations(false);
}

/**
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"1900A63D-53E1-436C-8D45-49B57B51DB2E"}
 */
function nascondiTutto(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event)
{
	
}

/**
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"B13853EC-F423-4F3D-8680-25B384BC1C2C"}
 */
function recuperaTutto(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event)
{
	
}

/** *
 * @param _event
 * @param _form
 *
 * @properties={typeid:24,uuid:"9B5EF85D-1A1B-45B7-9B29-791A32792480"}
 */
function onRecordSelection(_event, _form) {
	
	_super.onRecordSelection(_event, _form)
//    aggiornaStatoOperazione(null,null,null,null,null,null);

}

/**
 * @properties={typeid:24,uuid:"7A8B9582-6029-4CFB-8C54-913EC6905E76"}
 */
function mostraIdentificativo(_itemInd,_parItem,_isSel,_parMenTxt,_menuTxt,_event)
{
   var identificativo = foundset.getSelectedRecord().op_id;
   globals.ma_utl_showInfoDialog('Il codice da comunicare allo studio è : ' + identificativo,'Identificativo operazione');

}

/**
 * @param {Number} _itemInd
 * @param {Number} _parItem
 * @param {Boolean} _isSel
 * @param {String} _parMenTxt
 * @param {String} _menuTxt
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"47559B94-FF67-497E-B06D-AB18CD39B1E1"}
 */
function eliminaOperazione(_itemInd, _parItem, _isSel, _parMenTxt, _menuTxt, _event)
{
	if(!foundset.deleteRecord())
	   globals.ma_utl_showWarningDialog('Errore durante l\'eliminazione dell\'operazione','Elimina operazione');
	
}
/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"648FB691-A6D7-4A16-B438-6B21BC133058"}
 */
function onRenderStorico(event) 
{
	var rec = event.getRecord();
	if(rec)
	{
		if(rec['operationuser_to_operationlog.op_status'] == globals.OpStatus.SUCCESS
		   && rec['operationuser_to_operationlog.op_progress'] == 100)
	       event.getRenderable().bgcolor = 'green';
		else if(rec['operationuser_to_operationlog.op_status'] == globals.OpStatus.WARNING)
		   event.getRenderable().bgcolor = 'orange';
		else if(rec['operationuser_to_operationlog.op_status'] == globals.OpStatus.ERROR)
			   event.getRenderable().bgcolor = 'red';
		else if(rec['operationuser_to_operationlog.op_status'] == globals.OpStatus.ONGOING
				&& rec['operationuser_to_operationlog.op_progress'] != 100)
			event.getRenderable().bgcolor = 'blue';
		else
			event.getRenderable().bgcolor = 'default';
	}	
}
