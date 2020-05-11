/**
 * @type {Array}
 * 
 * @properties={typeid:35,uuid:"B8C4966E-7952-4DD6-ABD4-AC32E9EE3027",variableType:-4}
 */
var v_ditte = globals.getDitteControllate();

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"41AD9E90-B1B8-4C46-9C63-96D22540EC14",variableType:4}
 */
var vIdDitta = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"72367A42-05CB-46E8-AB2B-6AA9EEA82837",variableType:4}
 */
var vCodDitta = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8CAC6198-A8A7-4551-AE65-066D3F630122"}
 */
var vRagioneSociale = null;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"45948736-4E60-4D7D-819F-59C163C8BC4A",variableType:93}
 */
var vPeriodo = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9874BBD8-CDC5-4134-9C45-BD61F16C2718",variableType:8}
 */
var vTipoOperazione = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"AFE8532B-F542-45D5-B451-56F73955031E",variableType:8}
 */
var vStatoOperazione = null;

/**
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"11204E10-4652-4F21-975E-36F42E748D8B",variableType:-4}
 */
var _attivaParams;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"0E365E00-5325-4CF5-9C27-1BA0BA754B54"}
 */
var _attivaParamsJson = '';

/**
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"507E1B2C-E381-49D0-A1FB-DDC9EDEA7F55",variableType:-4}
 */
var _ctrParams;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"63C9204E-C93C-47A2-BB17-BCE77B696EBC"}
 */
var _ctrParamsJson = '';

/**
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"3459D314-8D07-4C3A-A1DB-85BBF2BA9B76",variableType:-4}
 */
var _evParams;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"08F675CD-8346-4F5A-9387-4D721B4E20B8"}
 */
var _evParamsJson = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"343F3900-078F-42EA-ACB8-98875458D14B"}
 */
var _giornCurrId = '';

/**
 * @type {Object}
 * 
 * @properties={typeid:35,uuid:"D5421469-9BAB-43E9-970B-80525062AA3B",variableType:-4}
 */
var _giornParams;

/**
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"97139060-7150-4A6B-B077-B7FAC048688B",variableType:-4}
 */
var _vociParams;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AA55D877-4358-4BEC-B54D-65CD39A5E52E"}
 */
var _vociParamsJson = '';

/**
 * Handle changed data.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6AAFBB23-EE46-40E1-B34B-6D248C4CA3EB"}
 * @AllowToRunInFind
 */
function onDataChangeDitta(oldValue, newValue, event) {
	
	if(newValue == '' || newValue == null)
	{
		vIdDitta = -1;
		vCodDitta = null;
		vRagioneSociale = '';
		return true;
	}
		
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte>} */
	var dittaFs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, 'ditte');
	if(dittaFs.find())
	{
		dittaFs.codice = newValue;
		if(dittaFs.search() > 0)
			updateDitta(dittaFs.getSelectedRecord());
		return true;
	}
	
	return false;
}

/**
 * @param {JSRecord<db:/ma_anagrafiche/ditte>} rec
 *
 * @properties={typeid:24,uuid:"68E1D9B2-0896-4B6A-985A-C1869EAF39D0"}
 */
function updateDitta(rec)
{
	vRagioneSociale = rec.ragionesociale;
	vCodDitta = rec.codice;
	vIdDitta = rec.idditta;
}

/**
 * Filtra le operazioni
 * 
 * @param {Boolean} [disableFilterButton]
 *
 * @properties={typeid:24,uuid:"65876AF2-264E-43B9-9C55-C8F76FC6CE8E"}
 * @AllowToRunInFind
 */
function filterOperations(disableFilterButton) 
{
	var filterString = ['Filtro applicato - '];
	var fs = _to_operationusers;
	
	fs.loadAllRecords();
	
	if(fs && fs.find())
	{
		if(vIdDitta > 0)
		{
			fs.operationuser_to_operationlog.op_ditta = globals.ma_utl_ditta_toSede(vIdDitta);
			filterString.push(' Ditta: ' + vCodDitta);
		}
		else
			fs.operationuser_to_operationlog.op_ditta = v_ditte;
		
		if(vPeriodo)
		{
			fs.operationuser_to_operationlog.op_periodo = parseInt(utils.dateFormat(vPeriodo, globals.PERIODO_DATEFORMAT));
			filterString.push(' Periodo: ' + utils.dateFormat(vPeriodo, 'MM/yyyy'));
		}
		
		if(vTipoOperazione)
		{
			fs.operationuser_to_operationlog.op_type = vTipoOperazione;
			filterString.push(' Operazione: ' + globals.getOperation(vTipoOperazione).descrizione);
		}
		
		if(vStatoOperazione !== null)
		{
			fs.operationuser_to_operationlog.op_status = vStatoOperazione;
			filterString.push(' Stato: ' + globals.getOperationStatusLabel(vStatoOperazione));
		}
		
		//solo operazioni visibili
		fs.operationuser_to_operationlog.hidden = 0;

		fs.search();
	}
	else
	{
		return;
	}
	
	fs.sort('operationuser_to_operationlog.op_start DESC')
	
	if(disableFilterButton)
	{
		elements.btn_filter.enabled = false;
		elements.btn_unfilter.enabled = true;
	}
	
	if(elements.lbl_vista_comunicazioni_filtro)
		elements.lbl_vista_comunicazioni_filtro.text = filterString[0] + filterString.slice(1, filterString.length).join(', ');
}

/**
 * @protected  
 * 
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"C4EEC1FB-A7CE-4CDC-9EA4-F538B0AC0B58"}
 * @AllowToRunInFind
 */
function unfilterOperations(event) 
{
	vCodDitta = null;
	vRagioneSociale = null;
	vPeriodo = null;
	vTipoOperazione = null;
	vStatoOperazione = null;
	
	var fs = _to_operationusers;
		fs.find();
		fs.operationuser_to_operationlog.op_ditta = v_ditte;
		fs.operationuser_to_operationlog.hidden = 0;
		fs.search();

	if(elements.btn_filter)
		elements.btn_filter.enabled = true;	
	if(elements.btn_unfilter)
		elements.btn_unfilter.enabled = false;
	
	if(elements.lbl_vista_comunicazioni_filtro)
		elements.lbl_vista_comunicazioni_filtro.text = 'Nessun filtro applicato';	
}

/**
 * TODO generated, please specify type and doc for the params
 * @param event
 *
 * @properties={typeid:24,uuid:"BADC1CC9-1665-4D6B-B0CA-7847686DBC95"}
 * @AllowToRunInFind
 */
function onLoad(event)
{
	_super.onLoad(event);
	
	foundset.find();
	foundset.operationuser_to_operationlog.op_ditta = v_ditte;
	foundset.search();
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"74EB719E-EFD9-417A-AC25-282213E5C930"}
 */
function onShowForm(firstShow, event)
{
	_super.onShowForm(firstShow, event);
	controller.readOnly = false;
    //unfilterOperations(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9BE40CEF-0B48-402B-B9E2-DC94C96A12EB"}
 */
function onActionBtnNascondiTutto(event) 
{		
	var fs = forms.mao_history.foundset;
	
	databaseManager.startTransaction();
	
    for (var i = 1; i <= fs.getSize(); i++)
	    fs.getRecord(i).operationuser_to_operationlog.hidden = 1;
	
	if(databaseManager.commitTransaction())
	   filterOperations();	
	else
	{
		databaseManager.revertEditedRecords();
		globals.ma_utl_showErrorDialog(plugins.rawSQL.getException().getMessage(), 'i18n:svy.fr.lbl_excuse_me');
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9F118355-D5C7-4564-A230-C46995587F47"}
 */
function onActionBtnRecupera(event) 
{
	//recuperiamo gli id delle operazioni relative all'id del client
	var sqlOps = 'SELECT op_id FROM OperationUser WHERE user_id = \'' + _to_sec_user$user_id.user_name + '\'';
	var dsOps = databaseManager.getDataSetByQuery(globals.Server.MA_LOG,sqlOps,null,10000);
	//la colonna degli id delle operazioni è la seconda
	var arrOps = dsOps.getColumnAsArray(1);
	
	var sqlRecuperaOps = 'UPDATE OperationLog SET hidden = 0 WHERE op_id IN (' + arrOps.map(function(op_idRec) {return '\'' + op_idRec + '\''}).join(',') + ')';
	
	if (vIdDitta > 0 || vPeriodo || vTipoOperazione || vStatoOperazione) {
		
		if (vIdDitta > 0) {
			sqlRecuperaOps += ' AND op_ditta = ' + vIdDitta;
		}
		if (vPeriodo) {
			sqlRecuperaOps += ' AND op_periodo = ' + parseInt(utils.dateFormat(vPeriodo, globals.PERIODO_DATEFORMAT));
		}
		if (vTipoOperazione) {
			sqlRecuperaOps += ' AND op_type = ' + vTipoOperazione;
		}
		if (vStatoOperazione) {
			sqlRecuperaOps += ' AND op_status = ' + vStatoOperazione;
		}
	
	}
	
	var updateResp = plugins.rawSQL.executeSQL(globals.Server.MA_LOG,sqlRecuperaOps,null);
	if(updateResp)
	{
		plugins.rawSQL.flushAllClientsCache(globals.Server.MA_LOG,'OperationLog');
		filterOperations();
	}
	else
	{
		globals.ma_utl_showErrorDialog(plugins.rawSQL.getException().getMessage(), 'i18n:svy.fr.lbl_excuse_me');
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FFFFDB4A-72F8-4D78-A96E-17D0E07E64D0"}
 */
function goToBrowse(event) 
{
   globals.svy_nav_dc_setStatus(globals.Status.BROWSE,controller.getName());
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"37EF5034-8356-45D7-AEF4-0ADCEEBF5D47"}
 */
function onHide(event) 
{
	gotoBrowse();
	_super.onHide(event);
    // eventuale ridisegno della giornaliera correntemente visualizzata 
	var selTabName = forms.svy_nav_fr_openTabs.vTabObjects[forms.svy_nav_fr_openTabs.vTabNames[forms.svy_nav_fr_openTabs.vSelectedTab]];
    if(selTabName && utils.stringLeft(selTabName.program,16) == 'LEAF_Giornaliera')
       globals['aggiornaGiornaliera']();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DDA72C1D-C49A-40AC-995B-0596770CC5E5"}
 */
function onActionChiudiStorico(event) 
{
	globals.svy_mod_closeForm(event);
	onHide(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *  * 
 * @private
 *
 * @properties={typeid:24,uuid:"8B556BB8-94C2-4030-A0C8-443B497D4AEA"}
 */
function onActionFilterOperations(event) 
{
	filterOperations(true);
}
