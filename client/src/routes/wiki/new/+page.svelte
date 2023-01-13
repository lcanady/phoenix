<script lang="ts">
  import { env } from "$env/dynamic/public";
  import axios from "axios";
  import { token, uploadFile, user, type IArticle } from "../../../stores";
  import { onMount } from "svelte";
  import ArticleEditor from "../../../components/ArticleEditor.svelte";
  import { afterNavigate, goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { base } from "$app/paths";

  let previousPage: string = base;

  afterNavigate(({ from }) => {
    previousPage = from?.url.pathname || previousPage;
  });

  onMount(async () => {
    const tkn = localStorage.getItem("token");
    if (tkn) {
      token.set(tkn);

      const res = await axios.get(`${env.PUBLIC_BASE_URL}auth/user`, {
        headers: {
          Authorization: "Bearer " + $token,
        },
      });

      user.set(res.data.user);
    }
  });

  const onSave = async (article: IArticle) => {
    if ($token) {
      if (article.shortFile?.length)
        article.shortImg = await uploadFile(article.shortFile[0]);
      if (article.longFile?.length)
        article.longImg = await uploadFile(article.longFile[0]);

      axios
        .post(`${env.PUBLIC_BASE_URL}wiki`, article, {
          headers: {
            Authorization: "Bearer " + $token,
          },
        })
        .then((res) => {
          goto(`/wiki/${res.data.slug}`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const onCancel = (article: IArticle) => {
    goto(previousPage);
  };

  const onDelete = (article: IArticle) => {
    goto("/wiki");
  };
</script>

<ArticleEditor
  article={{
    title: "",
    body: "",
    category: "general",
    lock: "",
    landing: false,
    featured: false,
    slug: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    default: false,
    createdBy: $user?.id,
    updatedBy: $user?.id,
  }}
  {onSave}
  {onDelete}
  {onCancel}
/>
