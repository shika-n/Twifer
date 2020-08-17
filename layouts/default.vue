<template>
  <v-app>
    <v-app-bar :clipped-left="true" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        v-if="!isSmallDevice()"
        icon
        @click.stop="drawerShrinked = !drawerShrinked"
      >
        <v-icon>
          mdi-{{ `chevron-${drawerShrinked ? 'right' : 'left'}` }}
        </v-icon>
      </v-btn>
      <v-toolbar-title>
        <strong class="primary--text">
          Twifer
        </strong>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-switch
        v-model="$vuetify.theme.dark"
        :label="`Dark Mode`"
        :color="`accent`"
      ></v-switch>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="drawerShrinked && !isSmallDevice()"
      :clipped="true"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="item in drawerItems"
          :key="item.text"
          :to="item.to"
          router
        >
          <v-list-item-action>
            <v-icon :color="`accent`">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            {{ item.text }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
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
  data() {
    return {
      drawer: true,
      drawerShrinked: true,
      drawerItems: [
        {
          icon: 'mdi-home',
          text: 'Home',
          to: '/',
        },
        {
          icon: 'mdi-heart',
          text: 'Favorites',
          to: '/favorites',
        },
        {
          icon: 'mdi-account-arrow-right',
          text: 'Following',
          to: '/following',
        },
        {
          icon: 'mdi-account-arrow-left',
          text: 'Followers',
          to: '/followers',
        },
        {
          icon: 'mdi-code-tags',
          text: 'Dev',
          to: '/color_test',
        },
      ],
    }
  },
  methods: {
    isSmallDevice() {
      return (
        this.$vuetify.breakpoint.md ||
        this.$vuetify.breakpoint.sm ||
        this.$vuetify.breakpoint.xs
      )
    },
  },
}
</script>
