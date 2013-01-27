#!/bin/bash

make clean
make CXXFLAGS="-O3 -Wall -march=native -pipe -std=c++98 -g -DCONFIG_ASSERT"

