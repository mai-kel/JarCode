FROM gcc:14

RUN apt-get update && \
    apt-get install -y cmake git && \
    apt-get clean

RUN git clone https://github.com/catchorg/Catch2.git /tmp/catch2 && \
    cd /tmp/catch2 && \
    cmake -B build && \
    cmake --build build --target install && \
    rm -rf /tmp/catch2

RUN useradd -m user
USER user
WORKDIR /home/user