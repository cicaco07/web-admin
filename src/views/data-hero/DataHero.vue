<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
// import { useQuery, useMutation } from '@vue/apollo-composable'
// import { gql } from '@apollo/client/core'

const heroes = ref<Array<any>>([]);

const query = `
  query GetHeroes {
    heroes {
      _id
      name
      alias
      role
      type
      short_description
      avatar
      release_date
    }
  }
`;

const createHeroMutation = `
  mutation CreateHero($input: CreateHeroInput!) {
    createHero(input: $input) {
      _id
      name
      alias
      role
      type
      short_description
      avatar
      release_date
    }
  }
`;

onMounted(async () => {
  const response = await fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });
  const result = await response.json();
  heroes.value = result.data?.heroes || [];
});

const createHero = async (input: any) => {
  const response = await fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: createHeroMutation,
      variables: { input }
    })
  });
  const result = await response.json();
  return result.data?.createHero;
};

const heroForm = ref({
  name: '',
  alias: '',
  role: '',
  type: '',
  short_description: '',
  avatar: '',
  release_date: ''
});
const isSubmitting = ref(false);

const resetForm = () => {
  heroForm.value = {
    name: '',
    alias: '',
    role: '',
    type: '',
    short_description: '',
    avatar: '',
    release_date: ''
  };
};

const handleAddHero = async () => {
  isSubmitting.value = true;
  try {
    // Proses role dan type menjadi array jika perlu
    const input = {
      ...heroForm.value,
      role: heroForm.value.role.split(',').map((r: string) => r.trim()).filter(Boolean),
      type: heroForm.value.type.split(',').map((t: string) => t.trim()).filter(Boolean)
    };
    const newHero = await createHero(input);
    if (newHero) {
      // Refresh data
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });
      const result = await response.json();
      heroes.value = result.data?.heroes || [];
      // Tutup modal
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-contact'))?.hide();
      resetForm();
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <div class="card bg-light-info shadow-none position-relative overflow-hidden">
      <div class="card-body px-4 py-3">
        <div class="row align-items-center">
          <div class="col-9">
            <h4 class="fw-semibold mb-8">Data Hero</h4>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a class="text-muted " href="/dashboard">Dashboard</a></li>
                <li class="breadcrumb-item" aria-current="page">Data Hero</li>
              </ol>
            </nav>
          </div>
          <div class="col-3">
            <div class="text-center mb-n5">
              <img src="/dist/images/breadcrumb/ChatBc.png" alt="" class="img-fluid mb-n4">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Hero</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-info btn-rounded m-t-10 mb-2"
                data-bs-toggle="modal"
                data-bs-target="#add-contact"
              >
                Add New Contact
              </button>
            </div>
            <!-- Add Contact Popup Model -->
            <div
              id="add-contact"
              class="modal fade in"
              tabindex="-1"
              role="dialog"
              aria-labelledby="myModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-dialog-scrollable modal-lg">
                <div class="modal-content">
                  <div class="modal-header d-flex align-items-center">
                    <h4 class="modal-title" id="myModalLabel">
                      Add New Contact
                    </h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form class="form-horizontal form-material" @submit.prevent="handleAddHero">
                      <div class="form-group">
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="name"
                            v-model="heroForm.name"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Alias"
                            v-model="heroForm.alias"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Role (pisahkan dengan koma jika lebih dari satu)"
                            v-model="heroForm.role"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Type (pisahkan dengan koma jika lebih dari satu)"
                            v-model="heroForm.type"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Deskripsi Singkat"
                            v-model="heroForm.short_description"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Avatar URL"
                            v-model="heroForm.avatar"
                            required
                          />
                        </div>
                        <div class="col-md-12 mb-3">
                          <input
                            type="date"
                            class="form-control"
                            placeholder="Tanggal Rilis"
                            v-model="heroForm.release_date"
                            required
                          />
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button
                          type="submit"
                          class="btn btn-info waves-effect"
                          :disabled="isSubmitting"
                        >
                          {{ isSubmitting ? 'Saving...' : 'Save' }}
                        </button>
                        <button
                          type="button"
                          class="btn btn-default waves-effect"
                          data-bs-dismiss="modal"
                          @click="resetForm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <!-- /.modal-content -->
              </div>
              <!-- /.modal-dialog -->
            </div>
            <div class="table-responsive">
              <table
                id="demo-foo-addrow"
                class="
                  table table-bordered
                  m-t-30
                  table-hover
                  contact-list
                "
                data-paging="true"
                data-paging-size="7"
              >
                <thead>
                  <tr class="text-center">
                    <th>No</th>
                    <th>Nama</th>
                    <th>Avatar</th>
                    <th>Alias</th>
                    <th>Tipe</th>
                    <th>Role</th>
                    <th>Deskripsi Singkat</th>
                    <th>Tanggal Rilis</th>
                    <td>Aksi</td>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(hero, index) in heroes"
                    :key="hero._id"
                    class="text-center align-items-center"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ hero.name }}</td>
                    <td>
                      <img :src="hero.avatar" class="w-50 rounded-circle" alt="Avatar">
                    </td>
                    <td>{{ hero.alias }}</td>
                    <td>
                      <span
                        v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                        :key="i"
                        class="badge bg-danger me-1"
                      > 
                        {{ type }}
                      </span>
                    </td>
                    <td><span
                        v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                        :key="i"
                        class="badge bg-danger me-1"
                      > 
                        {{ role }}
                      </span></td>
                    <td>{{ hero.short_description }}</td>
                    <td>{{ new Date(hero.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>