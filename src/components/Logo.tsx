import React from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, style }) => {
  return (
    <Image
      source={require('../assets/images/logo.png')}
      style={[
        styles.logo,
        { width: size, height: size },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
  },
});



