if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/shmuelmalikov/.gradle/caches/8.10.2/transforms/8b41b2a2270ab57e5a6af73f1f006e4f/transformed/hermes-android-0.76.3-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/shmuelmalikov/.gradle/caches/8.10.2/transforms/8b41b2a2270ab57e5a6af73f1f006e4f/transformed/hermes-android-0.76.3-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

