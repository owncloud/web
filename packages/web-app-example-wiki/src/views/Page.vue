<template>
  <iframe id="wiki-page" :src="'https://en.wikipedia.org/?curid=' + $route.params.id"></iframe>
</template>

<style lang="scss">
#wiki-page {
  width: 100%;
  height: 100%;
}
</style>
