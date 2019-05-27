/**
 * Aggiorna lo stato degli utenti cessati rimuovendoli automaticamente dai gruppi
 * e dalle organizzazioni alle quali sono eventualmente associati da più di 70 giorni
 * 
 * @properties={typeid:24,uuid:"038D74B5-3500-4F2F-906D-B0F085BDA496"}
 * @AllowToRunInFind
 */
function updateSecUserLavoratori()
{
	var msg = '';
	var msgUsers = '';
	
	/** @type {JSFoundSet<db:/svy_framework/sec_user>} */
	var fsUser = databaseManager.getFoundSet(globals.Server.SVY_FRAMEWORK,'sec_user');
	if(fsUser.find())
		fsUser.search();
	
	var fsUserSize = fsUser.getSize();
	for(var r = 1; r <= fsUserSize; r++)
	{
		var idLavoratore = fsUser.getRecord(r).sec_user_to_sec_user_to_lavoratori.idlavoratore;
		var codice = globals.getCodLavoratore(idLavoratore);
		var nominativo = globals.getNominativo(idLavoratore);
		var dataOdierna = globals.TODAY;
		var dataRiferimento = new Date(dataOdierna.getFullYear(),dataOdierna.getMonth(),dataOdierna.getDate() - 70);
		if(idLavoratore 
		   && globals.getDataCessazione(idLavoratore)
		   && globals.getDataCessazione(idLavoratore) < dataRiferimento)
		{
			/** @type {JSFoundSet<db:/svy_framework/sec_user_org>} */
			var fsUserOrg = fsUser.getRecord(r).sec_user_to_sec_user_org;
			if(fsUserOrg.getSize())
			{
				fsUserOrg.deleteAllRecords();
				msgUsers += ('Codice : ' + codice + ' - Nominativo : ' + nominativo + '<br/>');
			}
		}
	}			
	
	if(msgUsers != '')
	{
		msg += ('Poiché aventi una data di cessazione superiore a due mesi fa, i seguenti utenti sono stati rimossi dai relativi gruppi di appartenenza : <br/>' + msgUsers);
		msg += '<br/><br/>';
		msg += 'Controllatene lo stato nelle <b>Autorizzazioni</b>'; 
		
		globals.ma_utl_showWarningDialog(msg);
	}
}

/**
 * Aggiorna lo stato dell'utente cessato rimuovendolo dai gruppi
 * e dalle organizzazioni ai quali è eventualmente associato da più di 70 giorni
 * 
 * @param {Number} idLavoratore
 * 
 * @properties={typeid:24,uuid:"DF0F0E9F-FAE1-4A5B-8575-8A77D01DCF89"}
 * @AllowToRunInFind
 */
function updateSecUserLavoratore(idLavoratore)
{
	var msg = '';
	var msgUsers = '';
	
	/** @type {JSFoundSet<db:/svy_framework/sec_user>} */
	var fsUser = databaseManager.getFoundSet(globals.Server.SVY_FRAMEWORK,'sec_user');
	if(fsUser.find())
	{
		fsUser.sec_user_to_sec_user_to_lavoratori.idlavoratore = idLavoratore;
		if(fsUser.search())
		{
			var dataOdierna = globals.TODAY;
			var dataRiferimento = new Date(dataOdierna.getFullYear(),dataOdierna.getMonth(),dataOdierna.getDate() - 70);
			var fsUserSize = fsUser.getSize();
			for(var r = 1; r <= fsUserSize; r++)
			{
				var codice = globals.getCodLavoratore(idLavoratore);
				var nominativo = globals.getNominativo(idLavoratore);
				if(idLavoratore 
				   && globals.getDataCessazione(idLavoratore)
				   && globals.getDataCessazione(idLavoratore) < dataRiferimento)
				{
					/** @type {JSFoundSet<db:/svy_framework/sec_user_org>} */
					var fsUserOrg = fsUser.sec_user_to_sec_user_org;
					if(fsUserOrg.getSize())
					{
						fsUserOrg.deleteAllRecords();
						msgUsers += ('Codice : ' + codice + ' - Nominativo : ' + nominativo + '<br/>');
					}
				}
			}			
		}
	}
	
	if(msgUsers != '')
	{
		msg += ('In seguito all\'inserimento di una data di cessazione, i seguenti utenti sono stati rimossi dai relativi gruppi di appartenenza : <br/>' + msgUsers);
		msg += '<br/><br/>';
		msg += 'Controllatene lo stato nelle <b>Autorizzazioni</b>'; 
		
		globals.ma_utl_showWarningDialog(msg);
	}
}