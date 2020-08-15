<template>
  <v-container>
    <v-btn :color="`primary`">
      <span style="color: white;">PRI</span>
      &nbsp;
      <span style="color: black;">PRI</span>
    </v-btn>
    <v-banner :color="`secondary`">
      <v-text-field label="test"></v-text-field>
    </v-banner>
    <pre>
      MD: {{ $vuetify.breakpoint.md }}
      SM: {{ $vuetify.breakpoint.sm }}
      XS: {{ $vuetify.breakpoint.xs }}
    </pre>
    a<br />
    a<br />
    a<br />
    a<br />
    a<br />
    a<br />
  </v-container>
</template>
