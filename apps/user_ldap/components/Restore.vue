<template>
    <i class="material-icons uk-position-small uk-position-center-right uk-text-muted" :uk-tooltip="'Reset to ' + server.host">restore</i>
</template>
<script>
export defaults {
    data () {
        return {
            tooltip : ""
        }
    }
}
</script>
