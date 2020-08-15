<template>
  <v-row>
    <v-dialog v-model="notAuth" persistent width="400">
      <v-card>
        <v-card-title>
          Login with Twitter
        </v-card-title>
        <v-card-text>
          Allow this app to access your account to track favorites, following,
          and followers.
        </v-card-text>
        <v-card-actions>
          <v-container>
            <v-row justify="end">
              <v-btn
                :color="`light-blue lighten-2`"
                href="api/twitter/auth"
                dark
              >
                Authenticate
              </v-btn>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      test
    </v-card>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      notAuth: true,
    }
  },
}
</script>
