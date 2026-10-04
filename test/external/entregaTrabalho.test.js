import { api } from '../helpers/api.js';
import { expect } from 'chai';
import { comTokenAdmin, comTokenAluno } from '../helpers/auth.js';
import trabalhos from '../fixtures/trabalhos.json' with { type: 'json' };

describe('Entrega de Trabalho', () => {

    trabalhos.forEach((dadosTeste) => {

        it(dadosTeste.testTitle, async () => {

            const id = Date.now();

            const aluno = {
                nome: 'Aluno Teste',
                email: `aluno.teste.${id}@email.com`,
                matricula: `MAT${id}`,
                senha: '123456'
            };

            // 1. Admin cadastra o aluno
            const cadastraAlunoResposta = await api()
                .post('/api/admin/alunos')
                .set('Content-Type', 'application/json')
                .set('Authorization', await comTokenAdmin())
                .send(aluno);

            expect(cadastraAlunoResposta.status).to.equal(201);
            expect(cadastraAlunoResposta.body.nome).to.equal(aluno.nome);
            expect(cadastraAlunoResposta.body.email).to.equal(aluno.email);
            expect(cadastraAlunoResposta.body.matricula).to.equal(aluno.matricula);
            expect(cadastraAlunoResposta.body).to.have.property('id');

            const alunoId = cadastraAlunoResposta.body.id;

            //2. Fazer login com o aluno recém-cadastrado
            const tokenAluno = await comTokenAluno(
                aluno.email,
                aluno.senha
            );

            expect(tokenAluno).to.be.a('string');
            expect(tokenAluno).to.include('Bearer ');

            //3. Cadastra disciplina
            const disciplina = {
                nome: 'Automacao de Testes',
                codigo: `AUT${id}`,
                cargaHoraria: 60
            };

            const cadastraDisciplinaResposta = await api()
                .post('/api/admin/disciplinas')
                .set('Content-Type', 'application/json')
                .set('Authorization', await comTokenAdmin())
                .send(disciplina);

            expect(cadastraDisciplinaResposta.status).to.equal(201);
            expect(cadastraDisciplinaResposta.body.nome).to.equal(disciplina.nome);
            expect(cadastraDisciplinaResposta.body.codigo).to.equal(disciplina.codigo);
            expect(cadastraDisciplinaResposta.body.cargaHoraria).to.equal(disciplina.cargaHoraria);
            expect(cadastraDisciplinaResposta.body).to.have.property('id');

            const disciplinaId = cadastraDisciplinaResposta.body.id;

            // 4. Matricula aluno na disciplina
            const matriculaResposta = await api()
                .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', await comTokenAdmin())
                .send({ alunoId });

            expect(matriculaResposta.status).to.equal(201);
            expect(matriculaResposta.body.alunoId).to.equal(alunoId);
            expect(matriculaResposta.body.disciplinaId).to.equal(disciplinaId);
            expect(matriculaResposta.body).to.have.property('id');
            expect(matriculaResposta.body).to.have.property('dataMatricula');

            const trabalho = {
                disciplinaId,
                titulo: dadosTeste.titulo,
                descricao: dadosTeste.descricao
            };

            const cadastraTrabalhoResposta = await api()
                .post(`/api/alunos/${alunoId}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAluno)
                .send(trabalho);

            expect(cadastraTrabalhoResposta.status).to.equal(dadosTeste.statusEsperado);
            expect(cadastraTrabalhoResposta.body.alunoId).to.equal(alunoId);
            expect(cadastraTrabalhoResposta.body.disciplinaId).to.equal(disciplinaId);
            expect(cadastraTrabalhoResposta.body.titulo).to.equal(trabalho.titulo);
            expect(cadastraTrabalhoResposta.body.descricao).to.equal(trabalho.descricao);
            expect(cadastraTrabalhoResposta.body.status).to.equal('entregue');
            expect(cadastraTrabalhoResposta.body.nota).to.equal(null);
            expect(cadastraTrabalhoResposta.body.feedback).to.equal(null);
            expect(cadastraTrabalhoResposta.body).to.have.property('dataEntrega');
            expect(cadastraTrabalhoResposta.body).to.have.property('id');

        });

    });

});