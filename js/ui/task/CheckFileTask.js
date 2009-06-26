Ext.namespace('ui', 'ui.task');

// config - {prefix, ftype, fid, fpath, fname, lang, storeIdx}
ui.task.CheckFileTask = function(config)
{
    Ext.apply(this,config);

    Ext.getBody().mask(
        '<img src="themes/img/loading.gif" style="vertical-align: middle;" /> ' +
        _('Checking for error. Please, wait...')
    );

    XHR({
        scope  : this,
        url    : './php/controller.php',
        params : {
            task        : 'checkFileError',
            FilePath    : this.fpath,
            FileName    : this.fname,
            FileLang    : this.lang,
            FileContent : Ext.getCmp(this.prefix + '-' + this.ftype +
                                        '-FILE-' + this.fid).getCode()
        },
        success : function(response)
        {
            Ext.getBody().unmask();

            var o = Ext.util.JSON.decode(response.responseText);

            // If there is some errors, we display this
            if (o.error && o.error_first !== '-No error-') {

                Ext.getCmp('main-panel').add({
                    id         : 'FE-help-' + this.fid,
                    title      : 'Error in ' + this.fname,
                    iconCls    : 'FilesError',
                    closable   : true,
                    autoScroll : true,
                    autoLoad   : './error_type.php?dir=' +
                                 this.fpath + '&file=' + this.fname
                });

                Ext.getCmp('main-panel').setActiveTab('FE-help-' + this.fid);

            } else {
                // If there is no error, we display an information message
                Ext.MessageBox.show({
                    title   : _('Check for errors'),
                    msg     : _('There is no error.'),
                    buttons : Ext.MessageBox.OK,
                    icon    : Ext.MessageBox.INFO
                });
            }

            // Now, We save LANG File
            new ui.task.SaveLangFileTask({
                prefix      : this.prefix,
                ftype       : this.ftype,
                fid         : this.fid,
                fpath       : this.fpath,
                fname       : this.fname,
                lang        : this.lang,
                storeRecord : this.storeRecord
            });

            if (this.prefix === 'FE') {
                // We must reload the iframe of error description
                Ext.getCmp(this.prefix + '-error-type-' + this.fid).setSrc(
                    './error_type.php?dir=' + this.fpath +
                    '&file=' + this.fname +
                    '&nocache=' + new Date().getTime()
                );
            }
        }
    });
}