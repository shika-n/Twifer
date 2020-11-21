<template>
  <v-app>
    <v-app-bar :clipped-left="true" fixed app>
      <v-toolbar-title>
        <strong class="primary--text">
          Twifer
        </strong>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn :color="`primary`" href="api/twitter/auth">
        Login with Twitter
      </v-btn>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<style>
html {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
</style>

<script>
export default {
  methods: {},
};
</script>
