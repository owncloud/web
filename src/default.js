import $   from "jquery";
import Vue from "vue";

const ocHead = new Vue({
    el : '#oc-head',
    data: {
        name        : 'owncloud',
        title       : 'ownCloud',
        description : null,
        author      : null,
        version     : null,
        icon        : null,
        license     : null,
        plugins     : {}
    },
    mounted () {
        const path = `/apps${document.location.pathname}`;

        $.getJSON(`${path}/package.json`, (data) => {

            const bundle   = $('<script>', {
                'src': `${path}/${data.main}`
            });

            this.name        = data.name,
            this.title       = data.title,
            this.description = data.description,
            this.author      = data.author,
            this.version     = data.version,
            this.icon        = data.icon,
            this.license     = data.license

            $('body').append( bundle );
        });
    }
});
