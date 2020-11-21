<template>
  <v-row>
    <v-dialog v-model="imageDialog">
      <v-container>
        <v-img :src="imageDialogSrc"></v-img>
      </v-container>
    </v-dialog>
    <v-col v-for="i in 30" :key="i" cols="12" sm="6" md="4" lg="3">
      <v-card>
        <v-img
          src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg"
          aspect-ratio="1.78"
          @click="
            imageDialog = true;
            imageDialogSrc =
              'https://cdn.vuetifyjs.com/images/parallax/material2.jpg';
          "
        >
          <div class="fill-height bottom-gradient" :class="`d-flex align-end`">
            <v-container fluid>
              <v-row align="center" dense>
                <v-col cols="2">
                  <v-avatar class="outlined" size="36">
                    <v-img src="images/img_test.png"></v-img>
                  </v-avatar>
                </v-col>
                <v-col>
                  <span class="white--text">User</span>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-img>
        <v-card-text class="text-truncate" style="text-align: justify;">
          <!-- prettier-ignore -->
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur maximus nibh eget tortor lobortis semper. Aenean sit amet condimentum metus. Donec blandit id ex eu malesuada. Nulla aliquam ut elit eu dignissim. Morbi dapibus elit non sem viverra dictum. Suspendisse suscipit fermentum erat sed interdum.
        </v-card-text>
        <v-card-actions>
          <v-btn text :color="`accent`">
            EDIT
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.v-avatar.outlined {
  border: 2px solid white;
  border-radius: 50%;
}

.bottom-gradient {
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.4) 0%,
    transparent 72px
  );
}
</style>

<script>
export default {
  data() {
    return {
      imageDialog: false,
      imageDialogSrc: "",
    };
  },
};
</script>
