FROM ubuntu:22.04

ARG NODE_VERSION=22
ARG JAVA_VERSION=21
ARG ANDROID_SDK_TOOLS=11076708
ARG ANDROID_SDK_ROOT=/sdk

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=$ANDROID_SDK_ROOT
ENV ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator

# Dependencias base
RUN apt-get update && apt-get install -y \
    curl unzip git wget zip openjdk-${JAVA_VERSION}-jdk \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && npm install -g npm@latest @vue/cli

# Android SDK
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools \
    && cd ${ANDROID_SDK_ROOT} \
    && wget https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_TOOLS}_latest.zip -O tools.zip \
    && unzip tools.zip -d cmdline-tools \
    && mv cmdline-tools/cmdline-tools cmdline-tools/latest \
    && rm tools.zip

RUN yes | sdkmanager --licenses \
    && sdkmanager --sdk_root=${ANDROID_SDK_ROOT} "platform-tools" "platforms;android-34" "build-tools;34.0.0"

WORKDIR /workspace
