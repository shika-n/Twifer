import colors from 'vuetify/es5/util/colors'

export default {
  customVariables: ['~/assets/variables.scss'],
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: colors.indigo.accent2,
        accent: '#ffcc33',
        secondary: '#fe7853',
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent3,
      },
      light: {
        primary: colors.indigo.accent2,
        accent: '#ffcc33',
        secondary: '#fe7853',
        info: colors.blue.lighten2,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent4,
      },
    },
  },
}
