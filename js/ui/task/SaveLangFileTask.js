Ext.namespace('ui', 'ui.task');

// config - {prefix, ftype, fid, fpath, fname, lang, storeRecord}
ui.task.SaveLangFileTask = function(config)
{
    Ext.apply(this, config);

    this.run = function()
    {
        var msg = Ext.MessageBox.wait(_('Saving data...'));

        XHR({
            scope  : this,
            url    : './php/controller.php',
            params : {
                task        : 'saveFile',
                filePath    : this.fpath,
                fileName    : this.fname,
                fileLang    : this.lang,
                fileContent : Ext.getCmp(this.prefix + '-' + this.ftype +
                                            '-FILE-' + this.fid).getCode()
            },
            success : function(response)
            {
                var o = Ext.util.JSON.decode(response.responseText);

                if (this.prefix === 'FE') {
                    // Update our store
                    phpDoc.storeFilesError.getAt(this.storeIdx).set('needcommit', true);
                    phpDoc.storeFilesError.getAt(this.storeIdx).set('maintainer', o.maintainer);
                    phpDoc.storeFilesError.getAt(this.storeIdx).commit();
                }

                if (this.prefix === 'FNU') {
                    // Update our store
                    this.storeRecord.set('revision', '1.' + o.new_revision);
                    this.storeRecord.set('needcommit', true);
                    this.storeRecord.set('maintainer', o.maintainer);
                    this.storeRecord.commit();
                }

                if (this.prefix === 'FNR') {
                    // Update our store
                    phpDoc.storeFilesNeedReviewed.getAt(this.storeIdx).set('needcommit', true);
                    phpDoc.storeFilesNeedReviewed.getAt(this.storeIdx).set('maintainer', o.maintainer);
                    phpDoc.storeFilesNeedReviewed.getAt(this.storeIdx).set('reviewed', o.reviewed);
                    phpDoc.storeFilesNeedReviewed.getAt(this.storeIdx).commit();
                }

                if (this.prefix === 'AF') {
                    this.storeRecord.getUI().addClass('modified'); // tree node
                }

                // Add this files into storePendingCommit
                phpDoc.addToPendingCommit(o.id, this.lang + this.fpath, this.fname, 'update');

                // Remove wait msg
                msg.hide();
            },
            failure : function(response)
            {
                // Remove wait msg
                msg.hide();
                phpDoc.winForbidden();
            }
        });
    }
}
